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
import { PasswordInput } from "@/components/auth/password-input"
import { signUpSchema, type SignUpInput } from "@/lib/auth-validation"

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
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Permintaan terkirim")
        await new Promise((resolve) => setTimeout(resolve, 100))
        router.push("/sign-in")
      } else {
        const error = await response.json()
        toast.error(error.message || "Gagal mengirim")
      }
    } catch {
      toast.error("Coba lagi")
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
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      aria-live="polite"
      aria-atomic="false"
    >
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel htmlFor="name">Nama</FieldLabel>
          <Input
            id="name"
            placeholder="Nama"
            autoComplete="name"
            aria-invalid={getFieldError("name").hasError}
            aria-describedby={getFieldError("name").errorId}
            {...form.register("name")}
            disabled={form.formState.isSubmitting}
            className="h-11 rounded-xl border-border/80 bg-background px-4 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
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
            placeholder="Email"
            autoComplete="email"
            aria-invalid={getFieldError("email").hasError}
            aria-describedby={getFieldError("email").errorId}
            {...form.register("email")}
            disabled={form.formState.isSubmitting}
            className="h-11 rounded-xl border-border/80 bg-background px-4 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
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
          <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
          <PasswordInput
            id="password"
            placeholder="Kata sandi"
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
          <FieldLabel htmlFor="confirm-password">
            Konfirmasi kata sandi
          </FieldLabel>
          <PasswordInput
            id="confirm-password"
            placeholder="Ulangi"
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
            className="h-11 w-full rounded-xl font-semibold shadow-sm"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Mengirim..." : "Kirim"}
          </Button>
        </Field>
        <FieldDescription className="text-center text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary underline-offset-4 transition-opacity hover:opacity-70"
          >
            Masuk
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}
