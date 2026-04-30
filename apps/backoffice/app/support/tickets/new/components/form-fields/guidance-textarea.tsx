"use client"

import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface GuidanceTextareaProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  guidance?: string
  required?: boolean
  minLength?: number
  maxLength?: number
  rows?: number
  error?: string
}

export function GuidanceTextarea({
  label,
  value,
  onChange,
  placeholder,
  guidance,
  required = false,
  minLength,
  maxLength = 5000,
  rows = 4,
  error,
}: GuidanceTextareaProps) {
  const charCount = value.length
  const isNearLimit = charCount > maxLength * 0.9
  const isTooShort = minLength && charCount > 0 && charCount < minLength

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={label}
          className={cn(
            "text-sm font-medium text-foreground",
            error && "text-destructive"
          )}
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <span
          className={cn(
            "text-xs",
            isNearLimit || isTooShort
              ? "font-medium text-destructive"
              : "text-muted-foreground"
          )}
        >
          {charCount}/{maxLength}
        </span>
      </div>

      {guidance && (
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-primary/90">{guidance}</p>
        </div>
      )}

      <Textarea
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        rows={rows}
        className={cn(
          "min-h-[120px] rounded-2xl border-border/70 bg-background/80 shadow-sm",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {minLength && charCount > 0 && charCount < minLength && (
        <p className="text-sm text-muted-foreground">
          Minimum {minLength} characters required ({charCount}/{minLength})
        </p>
      )}
    </div>
  )
}
