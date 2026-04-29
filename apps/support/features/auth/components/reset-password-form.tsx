"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import * as React from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { PasswordInput } from "@/features/auth/components/password-input"
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/features/auth/lib/auth-validation"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [baseId] = React.useState(
    () => `reset-${Math.random().toString(36).substring(2, 9)}`
  )

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const errors = form.formState.errors

  const getFieldError = (fieldName: keyof ResetPasswordInput) => {
    const error = errors[fieldName]
    return {
      hasError: !!error,
      errorId: error ? `${baseId}-${fieldName}-error` : undefined,
      errorMessage: error?.message,
    }
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error("Invalid reset link")
      return
    }

    try {
      const result = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, token }),
      })

      if (result.ok) {
        toast.success("Password reset successfully")
        await new Promise((resolve) => setTimeout(resolve, 100))
        router.push("/sign-in")
      } else {
        const error = await result.json()
        toast.error(error.message || "Failed to reset password")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  if (!token) {
    return (
      <form className="flex flex-col gap-6">
        <FieldGroup>
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Invalid reset link
            </h1>
            <p className="text-base text-muted-foreground">
              This link has expired or doesn&apos;t work.
            </p>
          </div>
          <Field>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
          </Field>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      aria-live="polite"
      aria-atomic="false"
    >
      <FieldGroup>
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Set a new password
          </h1>
          <p className="text-base text-muted-foreground">
            Choose something secure you&apos;ll remember
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={getFieldError("password").hasError}
            aria-describedby={getFieldError("password").errorId}
            {...form.register("password")}
            disabled={form.formState.isSubmitting}
          />
          {getFieldError("password").hasError && (
            <FieldDescription
              id={getFieldError("password").errorId}
              className="text-destructive"
            >
              {getFieldError("password").errorMessage}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <PasswordInput
            id="confirm-password"
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={getFieldError("confirmPassword").hasError}
            aria-describedby={getFieldError("confirmPassword").errorId}
            {...form.register("confirmPassword")}
            disabled={form.formState.isSubmitting}
          />
          {getFieldError("confirmPassword").hasError && (
            <FieldDescription
              id={getFieldError("confirmPassword").errorId}
              className="text-destructive"
            >
              {getFieldError("confirmPassword").errorMessage}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Resetting..." : "Reset password"}
          </Button>
        </Field>
        <FieldDescription className="text-center text-muted-foreground">
          <Link
            href="/sign-in"
            className="font-medium text-primary underline-offset-4 transition-opacity hover:opacity-70"
          >
            Back to sign in
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
