"use client"

import Link from "next/link"
import { FloatingPaths } from "@/components/floating-paths"
import { AlertTriangle, Home, ExternalLink } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-auth-form-bg text-foreground antialiased">
        <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Left: Brand content with animation */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-destructive/10 via-destructive/5 to-background p-8 md:p-12 lg:p-16 dark:from-destructive/20 dark:via-destructive/10 dark:to-background">
            <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20">
              <FloatingPaths position={3} />
            </div>

            {/* Logo */}
            <div className="relative z-10">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 font-heading font-semibold text-foreground transition-opacity hover:opacity-70"
              >
                <div className="text-destructive-foreground flex size-8 items-center justify-center rounded-xl bg-destructive shadow-lg shadow-destructive/20">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <span className="text-lg">Zilpo</span>
              </Link>
            </div>

            {/* Error message */}
            <div className="relative z-10 max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive shadow-sm">
                <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
                <span>Critical Error</span>
              </div>
              <h1 className="font-heading text-3xl leading-[1.15] font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                Application error
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                A critical error has occurred. The application cannot continue.
                Please refresh the page or contact support if the problem
                persists.
              </p>
            </div>

            {/* Status indicators */}
            <div className="relative z-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 shadow-sm">
                <div className="size-1.5 animate-pulse rounded-full bg-destructive" />
                <span className="font-medium">Global Error Boundary</span>
              </div>
            </div>
          </div>

          {/* Right: Action area */}
          <div className="relative flex flex-col justify-center bg-auth-form-bg p-6 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,auth-radial-gradient_0%,transparent_100%)] md:p-10 lg:p-12">
            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 font-heading font-semibold"
              >
                <div className="text-destructive-foreground flex size-8 items-center justify-center rounded-lg bg-destructive">
                  <AlertTriangle className="h-3 w-3" />
                </div>
                <span>Zilpo</span>
              </Link>
            </div>

            {/* Action buttons */}
            <div className="relative mx-auto w-full max-w-sm animate-in duration-700 fade-in slide-in-from-bottom-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                  Refresh Application
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Home className="h-4 w-4" />
                  Go to Home
                </Link>
                <Link
                  href="https://github.com/zilpo/zilpo/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <ExternalLink className="h-4 w-4" />
                  Report Issue
                </Link>
              </div>

              {/* Error reference */}
              {error.digest && (
                <div className="mt-6 rounded-lg border border-border bg-card/50 p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Error Reference
                  </p>
                  <p className="mt-1 font-mono text-xs text-foreground">
                    {error.digest}
                  </p>
                </div>
              )}

              {/* Help text */}
              <p className="mt-6 text-center text-sm text-muted-foreground">
                If you continue to experience this issue, please contact support
                with the error reference above.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
