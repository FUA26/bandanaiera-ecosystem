import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { SignInForm } from "@/components/auth/sign-in-form"

export default function SignInPage() {
  return (
    <AuthPageShell
      title="Masuk"
      description="Gunakan akun Anda untuk lihat tiket dan tindak lanjut."
    >
      <SignInForm />
    </AuthPageShell>
  )
}
