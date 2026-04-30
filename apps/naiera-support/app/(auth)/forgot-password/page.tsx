/**
 * Forgot Password Page
 *
 * Page where users can request a password reset email
 */

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata = {
  title: "Lupa Password - Bandanaiera Admin",
  description: "Reset password akun Anda",
}

export default function ForgotPasswordPage() {
  return (
    <div className="w-full">
      <div className="mb-10 flex items-center gap-3">
        <img
          src="/logo.svg"
          alt="Bandanaiera logo"
          width={40}
          height={40}
          className="object-contain"
        />
        <div>
          <h2 className="text-base leading-tight font-bold">
            Bandanaiera Admin
          </h2>
          <p className="text-xs leading-tight text-muted-foreground">
            Support operations platform
          </p>
        </div>
      </div>
      <div className="mb-8 space-y-2">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">
          Lupa Password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Jangan khawatir, kami akan mengirimkan instruksi untuk reset password
          Anda.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
