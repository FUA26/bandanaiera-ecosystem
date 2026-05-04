"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
import { PasswordInput } from "@/components/auth/password-input"
import { signInSchema, type SignInInput } from "@/lib/auth-validation"

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorId = React.useId()
  const callbackUrl = searchParams.get("callbackUrl")
  const fallbackUrl = "/tickets"

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
        toast.error("Email atau kata sandi salah")
      } else {
        toast.success("Berhasil masuk")
        await new Promise((resolve) => setTimeout(resolve, 100))
        router.push(callbackUrl || fallbackUrl)
        router.refresh()
      }
    } catch {
      toast.error("Coba lagi")
    }
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      aria-live="polite"
      aria-atomic="false"
    >
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? errorId : undefined}
            {...form.register("email")}
            disabled={form.formState.isSubmitting}
            className="h-11 rounded-xl border-border/80 bg-background px-4 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
          />
          {emailError && (
            <FieldDescription id={errorId} className="text-destructive">
              {emailError.message}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Lupa?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="Kata sandi"
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
            className="h-11 w-full rounded-xl font-semibold shadow-sm"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Masuk..." : "Masuk"}
          </Button>
        </Field>
        <FieldDescription className="text-center text-muted-foreground">
          Belum punya akses?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Ajukan
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
