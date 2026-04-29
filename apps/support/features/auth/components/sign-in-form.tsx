"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
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
  signInSchema,
  type SignInInput,
} from "@/features/auth/lib/auth-validation"

export function SignInForm() {
  const router = useRouter()
  const errorId = React.useId()

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const emailError = form.formState.errors.email
  const passwordError = form.formState.errors.password

  const onSubmit = async (data: SignInInput) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
      } else {
        toast.success("Signed in successfully")
        await new Promise((resolve) => setTimeout(resolve, 100))
        router.push("/dashboard")
        router.refresh()
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
            Let&apos;s get you building
          </h1>
          <p className="text-base text-muted-foreground">
            Sign in to pick up where you left off
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
            aria-describedby={emailError ? errorId : undefined}
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
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Forgot it?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={!!passwordError}
            aria-describedby={
              passwordError ? `password-error-${errorId}` : undefined
            }
            {...form.register("password")}
            disabled={form.formState.isSubmitting}
          />
          {passwordError && (
            <FieldDescription
              id={`password-error-${errorId}`}
              className="text-destructive"
            >
              {passwordError.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </Field>
        <FieldDescription className="text-center text-muted-foreground">
          New here?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Create an account
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
