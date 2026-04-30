"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { loginSchema } from "@/lib/validations/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Mail, Lock, Eye, EyeOff, ArrowRight, ScanFace } from "lucide-react"

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Use window.location for full page reload to ensure session is properly set
        window.location.href = "/"
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email atau NIK
        </Label>
        <div className="relative">
          <Mail
            className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground/60"
            strokeWidth={1.5}
          />
          <Input
            id="email"
            {...form.register("email")}
            type="email"
            placeholder="Masukkan email atau NIK"
            disabled={isLoading}
            className="h-11 rounded-xl border-muted/80 bg-background pl-10 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </Label>
        <div className="relative">
          <Lock
            className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground/60"
            strokeWidth={1.5}
          />
          <Input
            id="password"
            {...form.register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan password"
            disabled={isLoading}
            className="h-11 rounded-xl border-muted/80 bg-background pr-10 pl-10 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Eye className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between py-1 text-sm">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            className="h-4 w-4 rounded-sm border-muted-foreground/40 shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          />
          <label
            htmlFor="remember"
            className="cursor-pointer text-muted-foreground select-none"
          >
            Ingat saya
          </label>
        </div>
        <Link
          href="/forgot-password"
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          Lupa password?
        </Link>
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-xl bg-primary font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading ? "Memproses..." : "Masuk"}
      </Button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-4 text-muted-foreground">
            Atau masuk dengan
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          type="button"
          className="h-11 rounded-xl border-muted bg-background font-medium shadow-none transition-colors hover:bg-muted/50"
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          className="h-11 rounded-xl border-muted bg-background font-medium shadow-none transition-colors hover:bg-muted/50"
        >
          <ScanFace className="mr-3 h-5 w-5" strokeWidth={1.5} />
          E-KTP
        </Button>
      </div>

      <div className="pt-2 text-center text-sm">
        <span className="mr-1 text-muted-foreground">Belum punya akun?</span>
        <Link
          href="/register"
          className="inline-flex items-center font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Daftar sekarang <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </form>
  )
}
