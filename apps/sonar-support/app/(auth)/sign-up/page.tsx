import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export default function SignUpPage() {
  return (
    <AuthPageShell
      title="Minta akses"
      description="Isi data Anda untuk ajukan akses ke panel."
      badge="Akses"
    >
      <SignUpForm />
    </AuthPageShell>
  )
}
