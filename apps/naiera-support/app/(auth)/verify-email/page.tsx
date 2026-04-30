/**
 * Email Verification Page
 *
 * Page for verifying user email from email link
 * Server-side validates token and shows appropriate message
 */

import { Metadata } from "next"
import { redirect } from "next/navigation"

interface VerifyEmailPageProps {
  searchParams: {
    token?: string
  }
}

export const metadata: Metadata = {
  title: "Verifikasi Email",
  description: "Verifikasi alamat email Anda",
}

async function verifyToken(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    )

    const result = await response.json()
    return { success: response.ok, data: result }
  } catch {
    return { success: false, data: null }
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const token = searchParams.token

  // If no token provided, show error
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/20">
          <svg
            className="h-8 w-8 text-destructive dark:text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Tautan verifikasi tidak valid</h1>
          <p className="text-muted-foreground">
            Tautan verifikasi tidak valid. Pastikan Anda membuka tautan yang
            benar dari email.
          </p>
        </div>

        <div className="flex gap-4">
          <a
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Kembali ke daftar
          </a>
          <a
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Masuk
          </a>
        </div>
      </div>
    )
  }

  // Verify token on server
  const result = await verifyToken(token)

  // Success - already verified
  if (result.success && result.data?.alreadyVerified) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
          <svg
            className="h-8 w-8 text-primary dark:text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Email sudah diverifikasi</h1>
          <p className="text-muted-foreground">
            Email Anda sudah diverifikasi. Anda bisa masuk ke akun sekarang.
          </p>
        </div>

        <a
          href="/sign-in"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Masuk
        </a>
      </div>
    )
  }

  // Success
  if (result.success) {
    // Auto-redirect to sign in after 3 seconds
    setTimeout(() => {
      redirect("/sign-in?verified=true")
    }, 3000)

    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 dark:bg-green-500/20">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Email berhasil diverifikasi</h1>
          <p className="text-muted-foreground">
            Email Anda berhasil diverifikasi. Anda bisa masuk sekarang.
          </p>
        </div>

        <a
          href="/sign-in"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Masuk
        </a>

        <p className="text-xs text-muted-foreground">
          Dialihkan otomatis dalam 3 detik...
        </p>
      </div>
    )
  }

  // Error
  const errorMessage = result.data?.error || "Verifikasi gagal"
  const message =
    result.data?.message ||
    "Tautan verifikasi tidak valid atau sudah kedaluwarsa"

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/20">
        <svg
          className="h-8 w-8 text-destructive dark:text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{errorMessage}</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>

      <div className="flex gap-4">
        <a
          href="/sign-up"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Kembali ke daftar
        </a>
        <a
          href="/sign-in"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Masuk
        </a>
      </div>
    </div>
  )
}
