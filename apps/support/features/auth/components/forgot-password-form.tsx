"use client"

import Link from "next/link"
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
import { Input } from "@workspace/ui/components/input"
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth/lib/auth-validation"

export function ForgotPasswordForm() {
  const [baseId] = React.useState(
    () => `forgot-${Math.random().toString(36).substring(2, 9)}`
  )

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const emailError = form.formState.errors.email
  const errorId = emailError ? `${baseId}-email-error` : undefined

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const result = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (result.ok) {
        toast.success("Password reset email sent")
        form.reset()
      } else {
        const error = await result.json()
        toast.error(error.message || "Failed to send reset email")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
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
            Reset your password
          </h1>
          <p className="text-base text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!emailError}
            aria-describedby={errorId}
            {...form.register("email")}
            disabled={form.formState.isSubmitting}
          />
          {emailError && (
            <FieldDescription id={errorId} className="text-destructive">
              {emailError.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
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
