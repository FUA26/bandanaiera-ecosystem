"use client"

import { useState, Suspense, useEffect, type ReactNode } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TicketType } from "@/lib/ticketing/ticket-types"
import { getTicketTypeConfig } from "@/lib/ticketing/form-templates"
import { TicketTypeSelector } from "./components/ticket-type-selector"
import { SmartTicketForm } from "./components/smart-ticket-form"
import { SuccessState } from "./components/success-state"
import { LoadingState } from "./components/loading-state"
import type { AttachmentFile } from "@/components/ticketing/attachment-upload"

interface TokenData {
  email?: string
  externalUserId?: string
  channelSlug: string
  appId: string
}

type AppInfo = {
  name?: string
  slug?: string
}

function TicketForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const appSlug = searchParams.get("app")
  const channelParam = searchParams.get("channel")
  const embed = searchParams.get("embed") === "true"
  const tokenParam = searchParams.get("token")

  // Form state
  const [selectedType, setSelectedType] = useState<TicketType | null>(null)
  const [subject, setSubject] = useState("")
  const [templateFields, setTemplateFields] = useState<Record<string, string>>(
    {}
  )
  const [priority, setPriority] = useState("NORMAL")
  const [requesterInfo, setRequesterInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [attachments, setAttachments] = useState<File[]>([])

  // UI state
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [appLoading, setAppLoading] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    subject?: string
    templateFields?: Record<string, string>
    requesterName?: string
    requesterEmail?: string
  }>({})

  // Validate token and get app info (existing logic)
  useEffect(() => {
    const validateTokenAndGetInfo = async () => {
      if (!tokenParam) return

      try {
        const res = await fetch("/api/integrated/validate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenParam }),
        })

        if (res.ok) {
          const data = await res.json()
          setTokenData(data)
          setTokenValid(true)

          if (data.email) {
            setRequesterInfo((prev) => ({ ...prev, email: data.email }))
          }
        } else {
          const data = await res.json()
          setError(data.message || "Invalid or expired access token")
        }
      } catch (err) {
        console.error("Token validation error:", err)
        setError("Failed to validate access token")
      }
    }

    validateTokenAndGetInfo()
  }, [tokenParam])

  useEffect(() => {
    if (appSlug) {
      fetch(`/api/apps/by-slug/${appSlug}`)
        .then((res) => {
          if (!res.ok) throw new Error("App not found")
          return res.json()
        })
        .then((data) => {
          setAppInfo(data)
        })
        .catch(() => {
          setError("App not found or inactive")
        })
        .finally(() => {
          setAppLoading(false)
        })
    } else {
      setAppLoading(false)
    }
  }, [appSlug])

  // Handle type selection
  const handleTypeSelect = (type: TicketType) => {
    setSelectedType(type)
    const config = getTicketTypeConfig(type)
    setPriority(config?.defaultPriority || "NORMAL")

    // Clear previous template fields
    setTemplateFields({})
    setSubject("")
    setValidationErrors({})

    // Scroll to form
    setTimeout(() => {
      document
        .getElementById("ticket-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  // Handle form submission
  const handleSubmit = async () => {
    setError(null)
    setValidationErrors({})

    // Validate
    const errors: typeof validationErrors = {}

    if (!subject || subject.length < 5) {
      errors.subject = "Subject must be at least 5 characters"
    }

    if (!requesterInfo.email) {
      errors.requesterEmail = "Email is required"
    }

    if (!requesterInfo.name) {
      errors.requesterName = "Name is required"
    }

    // Validate required template fields
    if (selectedType) {
      const config = getTicketTypeConfig(selectedType)
      const templateErrors: Record<string, string> = {}

      config?.fields.forEach((field) => {
        const minLength = field.minLength ?? 0
        const fieldValue = templateFields[field.name]
        if (field.required && (!fieldValue || fieldValue.length < minLength)) {
          templateErrors[field.name] =
            `${field.label} is required and must be at least ${minLength} characters`
        }
      })

      if (Object.keys(templateErrors).length > 0) {
        errors.templateFields = templateErrors
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setLoading(true)

    // Convert File[] to AttachmentFile[] format for API
    const attachmentMetadata = attachments.map((file) => ({
      url: "", // Would be set after upload in a real implementation
      name: file.name,
      type: file.type,
      size: file.size,
    }))

    try {
      const res = await fetch("/api/public/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenParam,
          appSlug,
          channelType: tokenValid ? undefined : "WEB_FORM",
          ticketType: selectedType,
          subject,
          message: buildMessageFromTemplate(selectedType, templateFields),
          priority,
          guestEmail: requesterInfo.email || undefined,
          guestName: requesterInfo.name || undefined,
          guestPhone: requesterInfo.phone || undefined,
          attachments:
            attachmentMetadata.length > 0 ? attachmentMetadata : undefined,
          metadata: {
            templateFields,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to create ticket")
      }

      setCreatedTicketId(data.id)
      setSubmitted(true)

      if (tokenValid && tokenParam && data.id) {
        router.push(`/support/tickets/${data.id}?token=${tokenParam}`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const buildMessageFromTemplate = (
    type: TicketType | null,
    fields: Record<string, string>
  ): string => {
    if (!type) return ""

    const config = getTicketTypeConfig(type)
    let message = ""

    config?.fields.forEach((field) => {
      if (fields[field.name]) {
        message += `**${field.label}:**\n${fields[field.name]}\n\n`
      }
    })

    return message.trim()
  }

  const resetForm = () => {
    setSelectedType(null)
    setSubject("")
    setTemplateFields({})
    setPriority("NORMAL")
    setRequesterInfo({ name: "", email: tokenData?.email || "", phone: "" })
    setAttachments([])
    setSubmitted(false)
    setCreatedTicketId(null)
    setError(null)
    setValidationErrors({})
  }

  if (appLoading) {
    return <LoadingState embed={embed} />
  }

  if (!appSlug) {
    return (
      <PageStateShell embed={embed}>
        <div className="mx-auto max-w-3xl rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
          <p className="text-center text-destructive">
            Missing app parameter. Open this page with a URL like{" "}
            <span className="font-medium">?app=your-app-slug</span>.
          </p>
        </div>
      </PageStateShell>
    )
  }

  if (appSlug && !appInfo && !error) {
    return (
      <PageStateShell embed={embed}>
        <div className="mx-auto max-w-3xl rounded-2xl border border-destructive/20 bg-destructive/10 p-6">
          <p className="text-center text-destructive">
            App not found or inactive. Please check the URL and try again.
          </p>
        </div>
      </PageStateShell>
    )
  }

  if (submitted && tokenValid && tokenParam && createdTicketId) {
    return <LoadingState embed={embed} />
  }

  if (submitted && !tokenValid) {
    return (
      <PageStateShell embed={embed}>
        <SuccessState
          ticketId={createdTicketId || ""}
          appLabel={appInfo?.name || appSlug || "the app"}
          channelLabel={
            tokenData?.channelSlug || channelParam || "the default channel"
          }
          onReset={resetForm}
        />
      </PageStateShell>
    )
  }

  return (
    <PageStateShell embed={embed}>
      {!embed && (
        <header className="mx-auto mb-8 max-w-3xl space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Create Support Ticket
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {appInfo
              ? `Get help with ${appInfo.name}. Select your issue type below and we'll guide you through providing the right information.`
              : "Select your issue type below and we'll guide you through providing the right information."}
          </p>
        </header>
      )}

      {error && (
        <div className="mx-auto mb-6 max-w-3xl rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!selectedType ? (
        <TicketTypeSelector
          selectedType={selectedType}
          onSelectType={handleTypeSelect}
        />
      ) : (
        <div id="ticket-form" className="mx-auto max-w-3xl">
          <SmartTicketForm
            ticketType={selectedType}
            subject={subject}
            templateData={templateFields}
            priority={priority}
            requesterName={requesterInfo.name}
            requesterEmail={requesterInfo.email}
            requesterPhone={requesterInfo.phone}
            onSubjectChange={setSubject}
            onTemplateFieldChange={(field, value) =>
              setTemplateFields((prev) => ({ ...prev, [field]: value }))
            }
            onPriorityChange={setPriority}
            onRequesterNameChange={(value) =>
              setRequesterInfo((prev) => ({ ...prev, name: value }))
            }
            onRequesterEmailChange={(value) =>
              setRequesterInfo((prev) => ({ ...prev, email: value }))
            }
            onRequesterPhoneChange={(value) =>
              setRequesterInfo((prev) => ({ ...prev, phone: value }))
            }
            onFileUpload={(files) => setAttachments(files)}
            onBack={() => setSelectedType(null)}
            onSubmit={handleSubmit}
            isSubmitting={loading}
            errors={validationErrors}
          />
        </div>
      )}
    </PageStateShell>
  )
}

function PageStateShell({
  children,
  embed,
}: {
  children: ReactNode
  embed: boolean
}) {
  return (
    <div
      className={
        "relative min-h-screen overflow-hidden bg-background" +
        (!embed && " px-4 py-6 sm:px-6 sm:py-8 lg:px-8")
      }
    >
      <div className={"mx-auto w-full" + (embed ? " max-w-3xl" : " max-w-6xl")}>
        {children}
      </div>
    </div>
  )
}

export default function NewTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <TicketForm />
    </Suspense>
  )
}
