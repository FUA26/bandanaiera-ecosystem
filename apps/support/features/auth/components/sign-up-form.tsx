"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { PasswordInput } from "@/features/auth/components/password-input"
import {
  signUpSchema,
  type SignUpInput,
} from "@/features/auth/lib/auth-validation"

export function SignUpForm() {
  const router = useRouter()
  const [baseId] = React.useState(
    () => `signup-${Math.random().toString(36).substring(2, 9)}`
  )

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const errors = form.formState.errors

  const onSubmit = async (data: SignUpInput) => {
    try {
      const result = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (result.ok) {
        toast.success("Account created successfully")
        await new Promise((resolve) => setTimeout(resolve, 100))
        router.push("/sign-in")
      } else {
        const error = await result.json()
        toast.error(error.message || "Failed to create account")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  const getFieldError = (fieldName: keyof SignUpInput) => {
    const error = errors[fieldName]
    return {
      hasError: !!error,
      errorId: error ? `${baseId}-${fieldName}-error` : undefined,
      errorMessage: error?.message,
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
            Start building
          </h1>
          <p className="text-base text-muted-foreground">
            Create an account and skip the boilerplate
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            placeholder="Your name"
            autoComplete="name"
            aria-invalid={getFieldError("name").hasError}
            aria-describedby={getFieldError("name").errorId}
            {...form.register("name")}
            disabled={form.formState.isSubmitting}
          />
          {getFieldError("name").hasError && (
            <FieldDescription
              id={getFieldError("name").errorId}
              className="text-destructive"
            >
              {getFieldError("name").errorMessage}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={getFieldError("email").hasError}
            aria-describedby={getFieldError("email").errorId}
            {...form.register("email")}
            disabled={form.formState.isSubmitting}
          />
          {getFieldError("email").hasError && (
            <FieldDescription
              id={getFieldError("email").errorId}
              className="text-destructive"
            >
              {getFieldError("email").errorMessage}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
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
            {form.formState.isSubmitting
              ? "Creating account..."
              : "Create account"}
          </Button>
        </Field>
        <FieldDescription className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary underline-offset-4 transition-opacity hover:opacity-70"
          >
            Sign in
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
