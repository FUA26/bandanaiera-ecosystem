"use client"

/**
 * Reset Password Form Component
 *
 * Form for users to reset their password with a valid token
 */

import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { resetPasswordSchema } from "@/lib/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  EyeIcon,
  UserCheck01Icon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const newPassword = form.watch("password")

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0

    let strength = 0

    // Length check
    if (password.length >= 8) strength += 20
    if (password.length >= 12) strength += 10

    // Character variety
    if (/[a-z]/.test(password)) strength += 15 // lowercase
    if (/[A-Z]/.test(password)) strength += 15 // uppercase
    if (/[0-9]/.test(password)) strength += 20 // numbers
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20 // special characters

    return Math.min(strength, 100)
  }

  const passwordStrength = calculatePasswordStrength(newPassword)

  const getStrengthLabel = (strength: number): string => {
    if (strength === 0) return ""
    if (strength < 40) return "Lemah"
    if (strength < 70) return "Cukup"
    if (strength < 90) return "Baik"
    return "Kuat"
  }

  const getStrengthColor = (strength: number): string => {
    if (strength === 0) return "bg-muted"
    if (strength < 40) return "bg-destructive"
    if (strength < 70) return "bg-warning"
    if (strength < 90) return "bg-primary"
    return "bg-success"
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan")
      }

      setIsSuccess(true)
      toast.success("Kata sandi baru tersimpan.")

      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        window.location.href = "/sign-in"
      }, 2000)
    } catch (error) {
      console.error("Failed to reset password:", error)
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan")
    } finally {
      setIsLoading(false)
    }
  }

  // Show success message
  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="border-success/15 bg-success/10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border">
          <HugeiconsIcon
            icon={UserCheck01Icon}
            className="text-success h-7 w-7"
          />
        </div>

        <div className="space-y-2 text-center">
          <h3 className="text-xl font-semibold">Kata sandi tersimpan</h3>
          <p className="text-sm text-muted-foreground">
            Anda akan diarahkan ke halaman masuk.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <Field>
        <FieldLabel htmlFor="password">Kata sandi baru</FieldLabel>
        <FieldContent>
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi baru"
                autoComplete="new-password"
                {...form.register("password")}
                disabled={isLoading}
                className="h-11 rounded-xl border-border/80 bg-background px-4 pr-12 text-sm shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-11 px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <HugeiconsIcon
                  icon={showPassword ? ViewOffIcon : EyeIcon}
                  className="h-4 w-4 text-muted-foreground"
                />
                <span className="sr-only">
                  {showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"}
                </span>
              </Button>
            </div>

            {newPassword && (
              <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/20 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Kekuatan</span>
                  <span
                    className={`font-medium ${
                      passwordStrength < 40
                        ? "text-destructive"
                        : passwordStrength < 70
                          ? "text-warning"
                          : passwordStrength < 90
                            ? "text-primary"
                            : "text-success"
                    }`}
                  >
                    {getStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </FieldContent>
        <FieldError
          errors={
            form.formState.errors.password
              ? [form.formState.errors.password]
              : undefined
          }
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="confirmPassword">Ulangi kata sandi</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ulangi kata sandi"
              autoComplete="new-password"
              {...form.register("confirmPassword")}
              disabled={isLoading}
              className="h-11 rounded-xl border-border/80 bg-background px-4 pr-12 text-sm shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-60"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-11 px-3 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <HugeiconsIcon
                icon={showConfirmPassword ? ViewOffIcon : EyeIcon}
                className="h-4 w-4 text-muted-foreground"
              />
              <span className="sr-only">
                {showConfirmPassword
                  ? "Sembunyikan kata sandi"
                  : "Tampilkan kata sandi"}
              </span>
            </Button>
          </div>
        </FieldContent>
        <FieldError
          errors={
            form.formState.errors.confirmPassword
              ? [form.formState.errors.confirmPassword]
              : undefined
          }
        />
      </Field>

      <Button
        type="submit"
        className="h-11 w-full rounded-xl font-semibold shadow-sm"
        disabled={isLoading}
      >
        {isLoading ? "Menyimpan..." : "Simpan"}
      </Button>

      <div className="pt-1 text-center text-sm">
        <a
          href="/sign-in"
          className="text-primary underline-offset-4 hover:underline"
        >
          Kembali
        </a>
      </div>
    </form>
  )
}
