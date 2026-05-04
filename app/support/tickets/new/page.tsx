"use client"

import { useState, Suspense, useEffect, useMemo, type ReactNode } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import type { AppTicketTypeOption } from "@/lib/types/apps"
import { TicketTypeSelector } from "./components/ticket-type-selector"
import { SmartTicketForm } from "./components/smart-ticket-form"
import { SuccessState } from "./components/success-state"
import { LoadingState } from "./components/loading-state"

interface TokenData {
  email?: string
  externalUserId?: string
  channelSlug: string
  appId: string
}

type AppInfo = {
  id?: string
  name?: string
  slug?: string
  config?: {
    ticketTypes?: AppTicketTypeOption[]
  } | null
}

type UploadedAttachment = {
  id: string
  url: string
  name: string
  type: string
  size: number
}

function TicketForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const appSlug = searchParams.get("app")
  const channelParam = searchParams.get("channel")
  const embed = searchParams.get("embed") === "true"
  const tokenParam = searchParams.get("token")

  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("NORMAL")
  const [requesterInfo, setRequesterInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [attachments, setAttachments] = useState<File[]>([])

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
    message?: string
    requesterName?: string
    requesterEmail?: string
  }>({})

  const attachmentsEnabled = Boolean(tokenValid && tokenParam)
  const availableTicketTypes = useMemo(
    () =>
      appInfo?.config?.ticketTypes?.filter((item) => item.id && item.label) ??
      [],
    [appInfo]
  )
  const selectedTicketType = useMemo(
    () =>
      availableTicketTypes.find((item) => item.id === selectedTypeId) ?? null,
    [availableTicketTypes, selectedTypeId]
  )

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

  const handleTypeSelect = (typeId: string) => {
    setSelectedTypeId(typeId)
    setPriority("NORMAL")
    setSubject("")
    setMessage("")
    setValidationErrors({})

    setTimeout(() => {
      document
        .getElementById("ticket-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  useEffect(() => {
    if (
      selectedTypeId &&
      availableTicketTypes.length > 0 &&
      !availableTicketTypes.some((item) => item.id === selectedTypeId)
    ) {
      setSelectedTypeId(null)
      setSubject("")
      setMessage("")
    }
  }, [availableTicketTypes, selectedTypeId])

  const handleSubmit = async () => {
    setError(null)
    setValidationErrors({})

    const errors: typeof validationErrors = {}

    if (!subject || subject.length < 5) {
      errors.subject = "Subject must be at least 5 characters"
    }

    if (!message || message.length < 20) {
      errors.message = "Details must be at least 20 characters"
    }

    if (!requesterInfo.email) {
      errors.requesterEmail = "Email is required"
    }

    if (!requesterInfo.name) {
      errors.requesterName = "Name is required"
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setLoading(true)

    try {
      let uploadedAttachments: UploadedAttachment[] = []

      if (attachmentsEnabled && attachments.length > 0 && tokenParam) {
        const formData = new FormData()
        attachments.forEach((file) => {
          formData.append("files", file)
        })

        const uploadRes = await fetch("/api/upload/ticket-attachment", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenParam}`,
          },
          body: formData,
        })

        const uploadData = await uploadRes.json()

        if (!uploadRes.ok) {
          throw new Error(
            uploadData.error || uploadData.message || "Failed to upload files"
          )
        }

        uploadedAttachments = Array.isArray(uploadData.files)
          ? uploadData.files
          : []

        if (uploadedAttachments.length !== attachments.length) {
          throw new Error("Failed to upload all attachments")
        }
      }

      const res = await fetch("/api/public/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenParam,
          appSlug,
          channelType: tokenValid ? undefined : "WEB_FORM",
          ticketType: selectedTypeId,
          subject,
          message,
          priority,
          guestEmail: requesterInfo.email || undefined,
          guestName: requesterInfo.name || undefined,
          guestPhone: requesterInfo.phone || undefined,
          attachments:
            uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
          metadata: {
            ticketTypeLabel: selectedTicketType?.label,
            ticketTypeDescription: selectedTicketType?.description,
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

  const resetForm = () => {
    setSelectedTypeId(null)
    setSubject("")
    setMessage("")
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
              ? `Get help with ${appInfo.name}. Select your issue type below and we'll guide you through providing the initial context.`
              : "Select your issue type below and we'll guide you through providing the initial context."}
          </p>
        </header>
      )}

      {error && (
        <div className="mx-auto mb-6 max-w-3xl rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {availableTicketTypes.length === 0 ? (
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Belum ada ticket type yang dikonfigurasi untuk app ini.
        </div>
      ) : !selectedTicketType ? (
        <TicketTypeSelector
          selectedType={selectedTypeId}
          availableTypes={availableTicketTypes}
          onSelectType={handleTypeSelect}
        />
      ) : (
        <div id="ticket-form" className="mx-auto max-w-3xl">
          <SmartTicketForm
            ticketType={selectedTicketType}
            subject={subject}
            message={message}
            priority={priority}
            requesterName={requesterInfo.name}
            requesterEmail={requesterInfo.email}
            requesterPhone={requesterInfo.phone}
            onSubjectChange={setSubject}
            onMessageChange={setMessage}
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
            attachmentsEnabled={attachmentsEnabled}
            onBack={() => setSelectedTypeId(null)}
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
