"use client"

import {
  useState,
  Suspense,
  useEffect,
  type FormEvent,
  type ReactNode,
} from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Mail,
  User,
  Phone,
  ArrowLeft,
} from "lucide-react"
import {
  AttachmentUpload,
  type AttachmentFile,
} from "@/components/ticketing/attachment-upload"
import { cn } from "@/lib/utils"
import { TicketTypeSelector } from "./components/ticket-type-selector"
import { TicketType } from "@/lib/ticketing/ticket-types"

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

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [appLoading, setAppLoading] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<TicketType | null>(null)

  // Form state
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("NORMAL")
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [attachments, setAttachments] = useState<AttachmentFile[]>([])

  const isExternalUserIdToken = tokenValid && tokenData?.externalUserId
  const appLabel = appInfo?.name || appSlug || "the selected app"
  const channelLabel =
    tokenData?.channelSlug || channelParam || "the default channel"

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
            setGuestEmail(data.email)
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const attachmentMetadata = attachments
      .filter((a) => a.uploadedUrl)
      .map((a) => ({
        url: a.uploadedUrl!,
        name: a.file.name,
        type: a.file.type,
        size: a.file.size,
      }))

    try {
      const res = await fetch("/api/public/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(tokenParam && { token: tokenParam }),
          appSlug,
          channelType: tokenValid ? undefined : "WEB_FORM",
          subject,
          message,
          priority,
          guestEmail: guestEmail || undefined,
          guestName: guestName || undefined,
          guestPhone: guestPhone || undefined,
          attachments:
            attachmentMetadata.length > 0 ? attachmentMetadata : undefined,
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
    setSubject("")
    setMessage("")
    setPriority("NORMAL")
    setGuestName("")
    setGuestEmail("")
    setGuestPhone("")
    setAttachments([])
    setSubmitted(false)
    setCreatedTicketId(null)
    setError(null)
    setSelectedType(null)
  }

  if (appLoading) {
    return <LoadingState embed={embed} />
  }

  if (!appSlug) {
    return (
      <PageStateShell embed={embed}>
        <Alert variant="destructive" className="max-w-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Missing app parameter. Open this page with a URL like
            <span className="font-medium"> ?app=your-app-slug</span>.
          </AlertDescription>
        </Alert>
      </PageStateShell>
    )
  }

  if (appSlug && !appInfo && !error) {
    return (
      <PageStateShell embed={embed}>
        <Alert variant="destructive" className="max-w-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            App not found or inactive. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </PageStateShell>
    )
  }

  if (submitted && tokenValid && tokenParam && createdTicketId) {
    return <LoadingState embed={embed} />
  }

  if (submitted && !tokenValid) {
    return (
      <PageStateShell embed={embed}>
        <Card className="mx-auto max-w-lg border-border/70 bg-card/95 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
          <CardHeader className="space-y-4 border-b border-border/60 bg-muted/20 p-6 text-left sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                Ticket created successfully
              </CardTitle>
              <CardDescription className="max-w-md">
                Your ticket has been created and is being processed.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-6 sm:p-8">
            <div className="space-y-3">
              <MetaRow label="App" value={appLabel} />
              <MetaRow label="Channel" value={channelLabel} />
              <MetaRow
                label="Access"
                value={tokenValid ? "Verified token" : "Public intake"}
              />
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                Ticket number
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {createdTicketId || "Loading..."}
              </p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              We have sent a confirmation email with your ticket details. Use
              the ticket number to track progress later.
            </p>
            <Button onClick={resetForm} className="w-full">
              Create another ticket
            </Button>
          </CardContent>
        </Card>
      </PageStateShell>
    )
  }

  return (
    <PageStateShell embed={embed}>
      {!embed && !selectedType && (
        <header className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
            <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1">
              Support intake
            </span>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
              {tokenValid ? "Verified access" : "Public form"}
            </span>
            <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1">
              {appLabel}
            </span>
          </div>
        </header>
      )}

      <div
        className={cn(
          "grid gap-8",
          embed ? "max-w-3xl" : "lg:grid-cols-[minmax(0,1fr)_300px]"
        )}
      >
        <div className="space-y-6">
          {!selectedType ? (
            <TicketTypeSelector
              selectedType={selectedType}
              onSelectType={setSelectedType}
            />
          ) : (
            <>
              {!embed && (
                <header className="max-w-3xl space-y-5">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedType(null)}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to type selection
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
                    <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1">
                      Support intake
                    </span>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                      {tokenValid ? "Verified access" : "Public form"}
                    </span>
                    <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1">
                      {appLabel}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      Send the right context the first time.
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                      Describe what happened, attach evidence if you have it,
                      and keep the report short enough to triage fast. The app
                      context, channel, and access state stay attached to the
                      ticket.
                    </p>
                  </div>
                </header>
              )}
              {!embed && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1">
                    App:{" "}
                    <span className="font-medium text-foreground">
                      {appLabel}
                    </span>
                  </span>
                  <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1">
                    Channel:{" "}
                    <span className="font-medium text-foreground">
                      {channelLabel}
                    </span>
                  </span>
                  <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1">
                    Attachments:{" "}
                    <span className="font-medium text-foreground">
                      Up to 3 files
                    </span>
                  </span>
                </div>
              )}

              <Card className="overflow-hidden border-border/70 bg-card/95 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
                <CardHeader className="space-y-4 border-b border-border/60 bg-muted/20 p-6 sm:p-8">
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                      New ticket
                    </Badge>
                    {tokenValid && (
                      <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium tracking-[0.22em] text-emerald-700 uppercase dark:text-emerald-300">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl sm:text-3xl">
                      Create Support Ticket
                    </CardTitle>
                    <CardDescription className="max-w-2xl leading-6">
                      {appInfo
                        ? `Submit a support ticket for ${appInfo.name}. The form is tuned for fast triage and clear ownership.`
                        : "Fill out the form below to create a support ticket."}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <section className="space-y-5">
                      <SectionHeading
                        eyebrow="Requester"
                        title="Your information"
                        description="Keep the contact details accurate so the team can reach you back."
                      />

                      {isExternalUserIdToken ? (
                        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 dark:bg-primary/15">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-primary">
                                You are signed in as{" "}
                                <strong>{tokenData?.externalUserId}</strong>
                              </p>
                              <p className="text-sm leading-6 text-primary/80">
                                Your request will be linked directly to your
                                account.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          <FieldBlock
                            label="Name"
                            icon={<User className="h-4 w-4" />}
                          >
                            <Input
                              id="guestName"
                              placeholder="Your name"
                              value={guestName}
                              autoComplete="name"
                              onChange={(e) => setGuestName(e.target.value)}
                              className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm"
                            />
                          </FieldBlock>

                          <FieldBlock
                            label="Email"
                            icon={<Mail className="h-4 w-4" />}
                            suffix={
                              tokenValid ? (
                                <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">
                                  Verified and locked
                                </span>
                              ) : null
                            }
                          >
                            <Input
                              id="guestEmail"
                              type="email"
                              placeholder="your@email.com"
                              value={guestEmail}
                              autoComplete="email"
                              onChange={(e) => setGuestEmail(e.target.value)}
                              required
                              readOnly={tokenValid}
                              className={cn(
                                "h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm",
                                tokenValid && "cursor-not-allowed bg-muted/70"
                              )}
                            />
                            {tokenValid && (
                              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                The verified email is locked for security.
                              </p>
                            )}
                          </FieldBlock>
                        </div>
                      )}

                      {!isExternalUserIdToken && (
                        <FieldBlock
                          label="Phone"
                          icon={<Phone className="h-4 w-4" />}
                          optional
                        >
                          <Input
                            id="guestPhone"
                            type="tel"
                            placeholder="+62 812 3456 7890"
                            value={guestPhone}
                            autoComplete="tel"
                            onChange={(e) => setGuestPhone(e.target.value)}
                            className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm"
                          />
                        </FieldBlock>
                      )}
                    </section>

                    <div className="border-t border-border/60" />

                    <section className="space-y-5">
                      <SectionHeading
                        eyebrow="Details"
                        title="What happened?"
                        description="Short, specific details help the team identify and reproduce the issue faster."
                      />

                      <div className="grid gap-5">
                        <FieldBlock label="Priority">
                          <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">
                                Low - General inquiry
                              </SelectItem>
                              <SelectItem value="NORMAL">
                                Normal - Standard request
                              </SelectItem>
                              <SelectItem value="HIGH">
                                High - Urgent issue
                              </SelectItem>
                              <SelectItem value="URGENT">
                                Urgent - Critical issue
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldBlock>

                        <FieldBlock
                          label="Subject"
                          icon={<MessageSquare className="h-4 w-4" />}
                          suffix={
                            <span className="text-xs text-muted-foreground">
                              {subject.length}/200
                            </span>
                          }
                        >
                          <Input
                            id="subject"
                            placeholder="Brief description of your issue"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            minLength={5}
                            maxLength={200}
                            className="h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm"
                          />
                        </FieldBlock>

                        <FieldBlock
                          label="Message"
                          suffix={
                            <span className="text-xs text-muted-foreground">
                              {message.length}/5000
                            </span>
                          }
                        >
                          <Textarea
                            id="message"
                            placeholder="Describe what you were doing, what you expected, and what happened instead."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            minLength={10}
                            maxLength={5000}
                            rows={7}
                            className="min-h-[180px] rounded-2xl border-border/70 bg-background/80 shadow-sm"
                          />
                        </FieldBlock>
                      </div>
                    </section>

                    <div className="border-t border-border/60" />

                    <section className="space-y-5">
                      <SectionHeading
                        eyebrow="Evidence"
                        title="Attachments"
                        description="Screenshots, logs, and documents make triage faster."
                      />

                      <AttachmentUpload
                        maxFiles={3}
                        value={attachments}
                        onFilesChange={setAttachments}
                        uploadEndpoint="ticket-attachment"
                        token={tokenParam || undefined}
                      />

                      <p className="text-xs leading-5 text-muted-foreground">
                        Max 3 files, 5MB each. Images: JPG, PNG, GIF, WebP.
                        Docs: PDF, DOC, DOCX, XLS, XLSX.
                      </p>
                    </section>

                    <div className="flex flex-col gap-3 border-t border-border/60 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                        The ticket keeps app and channel context attached so the
                        right team sees it immediately.
                      </p>
                      <Button
                        type="submit"
                        className="h-11 rounded-2xl px-5 sm:min-w-44"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Submit Ticket
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {!embed && selectedType && (
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-[28px] border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur">
              <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                Context
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">
                {appLabel}
              </h2>
              <p className="mt-2 max-w-[30ch] text-sm leading-6 text-muted-foreground">
                Keep the report short, practical, and specific. Routing data
                stays visible without competing with the form.
              </p>

              <div className="mt-4 space-y-3">
                <MetaRow label="App" value={appLabel} />
                <MetaRow label="Channel" value={channelLabel} />
                <MetaRow
                  label="Access"
                  value={tokenValid ? "Verified token" : "Public intake"}
                />
                <MetaRow label="Files" value="Up to 3 attachments" />
              </div>

              <div className="mt-5 border-t border-border/60 pt-4">
                <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                  Before sending
                </p>
                <ol className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-[11px] font-semibold text-foreground">
                      1
                    </span>
                    Describe the expected result, not just the symptom.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-[11px] font-semibold text-foreground">
                      2
                    </span>
                    Attach a screenshot, log file, or document if it saves a
                    back-and-forth.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-[11px] font-semibold text-foreground">
                      3
                    </span>
                    Use the verified email when the form locks it for security.
                  </li>
                </ol>
              </div>
            </section>
          </aside>
        )}
      </div>
    </PageStateShell>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function FieldBlock({
  label,
  icon,
  suffix,
  optional,
  children,
}: {
  label: string
  icon?: ReactNode
  suffix?: ReactNode
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {icon}
          {label}
          {optional && (
            <span className="text-xs font-normal text-muted-foreground">
              (Optional)
            </span>
          )}
        </Label>
        {suffix}
      </div>
      {children}
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
      <span className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
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
      className={cn(
        "relative min-h-screen overflow-hidden bg-background",
        !embed && "px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      )}
    >
      {!embed && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-12rem] left-[-10rem] h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-[14rem] right-[-8rem] h-[18rem] w-[18rem] rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute bottom-[-10rem] left-[30%] h-[16rem] w-[16rem] rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
      )}
      <div className={cn("mx-auto w-full", embed ? "max-w-3xl" : "max-w-6xl")}>
        {children}
      </div>
    </div>
  )
}

function LoadingState({ embed }: { embed: boolean }) {
  return (
    <PageStateShell embed={embed}>
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-lg border-border/70 bg-card/95 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur">
          <CardHeader className="space-y-4 border-b border-border/60 bg-muted/20 p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Badge className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                Loading
              </Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Loading support form</CardTitle>
              <CardDescription className="max-w-md leading-6">
                Preparing app context, token state, and the intake form.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6 sm:p-8">
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Almost there
                </p>
                <p className="text-sm text-muted-foreground">
                  Verifying the app and access data before showing the form.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetaRow label="Mode" value={embed ? "Embedded" : "Full page"} />
              <MetaRow label="State" value="Routing support" />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageStateShell>
  )
}

export default function NewTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <TicketForm />
    </Suspense>
  )
}
