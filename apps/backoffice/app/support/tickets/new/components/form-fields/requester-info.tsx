"use client"

import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { User, Mail, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

interface RequesterInfoProps {
  name: string
  email: string
  phone: string
  onChange: (field: "name" | "email" | "phone", value: string) => void
  emailLocked?: boolean
  tokenValid?: boolean
  externalUserId?: string
  errors?: {
    name?: string
    email?: string
    phone?: string
  }
}

export function RequesterInfo({
  name,
  email,
  phone,
  onChange,
  emailLocked = false,
  tokenValid = false,
  externalUserId,
  errors,
}: RequesterInfoProps) {
  if (externalUserId) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 dark:bg-primary/15">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">
              Signed in as <strong>{externalUserId}</strong>
            </p>
            <p className="text-sm leading-6 text-primary/80">
              Your request will be linked directly to your account.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="guestName"
          className="flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <User className="h-4 w-4" />
          Name
          <span className="text-xs font-normal text-muted-foreground">
            (Optional)
          </span>
        </Label>
        <Input
          id="guestName"
          type="text"
          value={name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className={cn(
            "h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm",
            errors?.name && "border-destructive"
          )}
        />
        {errors?.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="guestEmail"
          className="flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <Mail className="h-4 w-4" />
          Email
          {emailLocked && (
            <span className="ml-auto text-xs font-normal text-emerald-600 dark:text-emerald-400">
              Verified and locked
            </span>
          )}
        </Label>
        <Input
          id="guestEmail"
          type="email"
          value={email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          required
          readOnly={emailLocked}
          className={cn(
            "h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm",
            emailLocked && "cursor-not-allowed bg-muted/70",
            errors?.email && "border-destructive"
          )}
        />
        {emailLocked && (
          <p className="text-xs leading-5 text-muted-foreground">
            The verified email is locked for security.
          </p>
        )}
        {errors?.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="guestPhone"
          className="flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <Phone className="h-4 w-4" />
          Phone
          <span className="text-xs font-normal text-muted-foreground">
            (Optional)
          </span>
        </Label>
        <Input
          id="guestPhone"
          type="tel"
          value={phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="+62 812 3456 7890"
          autoComplete="tel"
          className={cn(
            "h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm",
            errors?.phone && "border-destructive"
          )}
        />
        {errors?.phone && (
          <p className="text-sm text-destructive">{errors.phone}</p>
        )}
      </div>
    </div>
  )
}
