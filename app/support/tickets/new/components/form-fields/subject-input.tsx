"use client"

import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@/lib/utils"

interface SubjectInputProps {
  value: string
  onChange: (value: string) => void
  prefix?: string
  error?: string
  required?: boolean
}

export function SubjectInput({
  value,
  onChange,
  prefix = "",
  error,
  required = true,
}: SubjectInputProps) {
  const charCount = value.length
  const maxLength = 200
  const isNearLimit = charCount > maxLength * 0.9

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="subject"
          className={cn(
            "text-sm font-medium text-foreground",
            error && "text-destructive"
          )}
        >
          Subject
          {required && <span className="text-destructive">*</span>}
        </Label>
        <span
          className={cn(
            "text-xs",
            isNearLimit
              ? "font-medium text-destructive"
              : "text-muted-foreground"
          )}
        >
          {charCount}/{maxLength}
        </span>
      </div>

      <Input
        id="subject"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          prefix ? `${prefix}: [brief description]` : "Brief description"
        }
        required={required}
        minLength={5}
        maxLength={maxLength}
        className={cn(
          "h-11 rounded-2xl border-border/70 bg-background/80 shadow-sm",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
