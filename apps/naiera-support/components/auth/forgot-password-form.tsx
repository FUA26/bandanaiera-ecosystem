"use client"

/**
 * Forgot Password Form Component
 *
 * Form for users to request a password reset email
 */

import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Input } from "@workspace/ui/components/input"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengirim")
      }

      setIsSuccess(true)
      toast.success("Jika email terdaftar, tautan sudah dikirim.")
    } catch (error) {
      console.error("Failed to send reset email:", error)
      toast.error(error instanceof Error ? error.message : "Gagal mengirim")
    } finally {
      setIsLoading(false)
    }
  }

  // Show success message
  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
          <CheckCircle2 className="h-7 w-7 text-primary" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            Tautan dikirim
          </h3>
          <p className="mx-auto max-w-[28ch] text-sm leading-6 text-muted-foreground">
            Jika email Anda terdaftar, kami sudah mengirim tautannya.
          </p>
        </div>

        <Button
          variant="outline"
          className="h-11 w-full rounded-xl border-border/80 bg-background font-semibold shadow-sm transition-colors hover:bg-muted/50"
          onClick={() => {
            setIsSuccess(false)
            form.reset()
          }}
        >
          Kirim lagi
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground/60"
            strokeWidth={1.5}
          />
          <Input
            id="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            {...form.register("email")}
            disabled={isLoading}
            className="h-11 rounded-xl border-border/80 bg-background pl-10 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email?.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-xl font-semibold shadow-sm"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Kirim...
          </>
        ) : (
          "Kirim tautan"
        )}
      </Button>

      <div className="pt-1 text-center text-sm">
        <a
          href="/sign-in"
          className="inline-flex items-center font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali
        </a>
      </div>
    </form>
  )
}
