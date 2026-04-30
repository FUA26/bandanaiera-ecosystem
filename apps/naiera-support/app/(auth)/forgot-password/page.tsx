/**
 * Forgot Password Page
 *
 * Page where users can request a password reset email
 */

import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata = {
  title: "Lupa Kata Sandi - Bandanaiera Admin",
  description: "Kirim tautan reset kata sandi",
}

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      title="Lupa kata sandi"
      description="Masukkan email Anda untuk menerima tautan reset."
      badge="Reset"
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  )
}
