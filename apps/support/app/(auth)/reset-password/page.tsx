import { Suspense } from "react"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
