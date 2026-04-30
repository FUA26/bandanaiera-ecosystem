/**
 * Login Page
 *
 * @pattern Authentication/Authorization
 * @pattern Page Route
 *
 * Public-facing login page that provides the authentication entry point
 * for the backoffice application. Displays branding and login form.
 *
 * Dependencies:
 * - @/components/auth/login-form: The login form component with validation
 *
 * Features:
 * - Displays application branding (logo, name, subtitle)
 * - Renders the LoginForm component
 * - Uses Next.js App Router file-based routing
 *
 * Route: /login
 * Access: Public (no authentication required)
 *
 * @see @/components/auth/login-form.tsx for form implementation
 * @see @/lib/auth/config.ts for authentication configuration
 */

import { LoginForm } from "@/components/auth/login-form"

/**
 * Login page component
 *
 * Renders the login page with branding header and login form.
 * This is a server component that composes the client-side LoginForm.
 */
export default function LoginPage() {
  return (
    <div className="w-full">
      {/* Branding header with logo and app name */}
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

      {/* Page heading */}
      <div className="mb-8 space-y-2">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">
          Selamat Datang Kembali
        </h1>
        <p className="text-sm text-muted-foreground">
          Masuk untuk mengakses panel admin dan layanan operasional.
        </p>
      </div>

      {/* Login form component */}
      <LoginForm />
    </div>
  )
}
