/**
 * Reset Password Page
 *
 * Page where users can reset their password using a valid token
 * Validates token on server side before showing form
 */

import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { prisma } from "@/lib/db/prisma"
import { hashToken, isTokenExpired } from "@/lib/tokens"
import { Alert02Icon, LockPasswordIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export const metadata = {
  title: "Atur Ulang Kata Sandi - Bandanaiera Admin",
  description: "Buat kata sandi baru",
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams
  const token = params.token

  // Validate token exists
  if (!token) {
    return (
      <AuthPageShell
        title="Tautan tidak valid"
        description="Minta tautan baru untuk lanjut."
        badge="Reset"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/15 bg-destructive/10">
            <HugeiconsIcon
              icon={Alert02Icon}
              className="h-7 w-7 text-destructive"
            />
          </div>
          <p className="mx-auto max-w-[30ch] text-sm leading-6 text-muted-foreground">
            Tautan ini tidak valid atau sudah kedaluwarsa.
          </p>
          <a
            href="/forgot-password"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Minta tautan baru
          </a>
        </div>
      </AuthPageShell>
    )
  }

  // Validate token with database
  const hashedToken = hashToken(token)
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
    },
    select: {
      id: true,
      email: true,
      passwordResetExpires: true,
    },
  })

  // Check if token is valid
  if (!user) {
    return (
      <AuthPageShell
        title="Tautan tidak valid"
        description="Minta tautan baru untuk lanjut."
        badge="Reset"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/15 bg-destructive/10">
            <HugeiconsIcon
              icon={Alert02Icon}
              className="h-7 w-7 text-destructive"
            />
          </div>
          <p className="mx-auto max-w-[30ch] text-sm leading-6 text-muted-foreground">
            Tautan ini tidak valid atau sudah digunakan.
          </p>
          <a
            href="/forgot-password"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Minta tautan baru
          </a>
        </div>
      </AuthPageShell>
    )
  }

  // Check if token has expired
  if (isTokenExpired(user.passwordResetExpires)) {
    return (
      <AuthPageShell
        title="Tautan kedaluwarsa"
        description="Minta tautan baru untuk lanjut."
        badge="Reset"
      >
        <div className="space-y-4 text-center">
          <div className="border-warning/15 bg-warning/10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border">
            <HugeiconsIcon
              icon={Alert02Icon}
              className="text-warning h-7 w-7"
            />
          </div>
          <p className="mx-auto max-w-[30ch] text-sm leading-6 text-muted-foreground">
            Tautan reset sudah kedaluwarsa.
          </p>
          <a
            href="/forgot-password"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Minta tautan baru
          </a>
        </div>
      </AuthPageShell>
    )
  }

  // Token is valid, show reset form
  return (
    <AuthPageShell
      title="Atur ulang kata sandi"
      description="Buat kata sandi baru."
      badge="Reset"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
            <HugeiconsIcon
              icon={LockPasswordIcon}
              className="h-5 w-5 text-primary"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Tautan cocok</p>
            <p className="text-xs text-muted-foreground">
              Buat kata sandi baru.
            </p>
          </div>
        </div>

        <ResetPasswordForm token={token} />
      </div>
    </AuthPageShell>
  )
}
