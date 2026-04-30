"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const toggleId = `toggle-${inputId}`

    return (
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn(
            "h-11 w-full min-w-0 rounded-xl border border-border/80 bg-background px-4 pr-12 text-sm text-foreground shadow-sm transition-colors outline-none placeholder:text-muted-foreground autofill:shadow-[inset_0_0_0_1000px_var(--background)] autofill:[-webkit-text-fill-color:var(--foreground)] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            className
          )}
          {...props}
        />
        <Button
          id={toggleId}
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-0 right-0 h-11 w-11 rounded-l-none border-l-0 px-2 text-muted-foreground hover:text-foreground"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">
            {showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          </span>
        </Button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
