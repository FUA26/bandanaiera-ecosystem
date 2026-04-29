"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { FloatingPaths } from "@/components/floating-paths"
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Home,
  FileQuestion,
} from "lucide-react"
import { getErrorMessage } from "@/lib/error-utils"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  const errorMessage = getErrorMessage(
    error,
    "Something went wrong while loading this page"
  )

  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      {/* Left: Brand content with animation */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-auth-gradient-from via-auth-gradient-via to-auth-gradient-to p-8 md:p-12 lg:p-16">
        <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20">
          <FloatingPaths position={2} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-heading font-semibold text-auth-heading transition-opacity hover:opacity-70"
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
            <span>Error</span>
          </div>
          <h1 className="font-heading text-3xl leading-[1.15] font-bold tracking-tight text-auth-heading md:text-4xl lg:text-5xl">
            Something went wrong
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-auth-subtle md:text-auth-muted">
            {errorMessage}. This shouldn't happen, and we're sorry for the
            interruption.
          </p>
        </div>

        {/* Trust indicators */}
        <div className="relative z-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-auth-subtle">
          <div className="flex items-center gap-2 rounded-full border border-auth-badge-border bg-auth-badge-bg px-3 py-1.5 shadow-sm">
            <div className="size-1.5 rounded-full bg-auth-brand-light" />
            <span className="font-medium">Next.js 16</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-auth-badge-border bg-auth-badge-bg px-3 py-1.5 shadow-sm">
            <div className="size-1.5 rounded-full bg-auth-brand-light" />
            <span className="font-medium">Error Boundary</span>
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

        {/* Action cards */}
        <div className="relative mx-auto w-full max-w-sm animate-in duration-700 fade-in slide-in-from-bottom-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                <FileQuestion className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-foreground">
                  What happened?
                </h2>
                <p className="text-sm text-muted-foreground">
                  An unexpected error occurred
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={reset}
                variant="default"
                size="lg"
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full gap-2"
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="w-full gap-2 text-muted-foreground"
              >
                <Link href="/sign-in">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>
            </div>
          </div>

          {/* Error details (dev only) */}
          {process.env.NODE_ENV === "development" && error.digest && (
            <details className="mt-4 rounded-lg border border-border bg-card/50 p-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Error Details
              </summary>
              <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
                {error.digest}
              </pre>
            </details>
          )}

          {/* Help text */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Problem persists?{" "}
            <Link
              href="https://github.com/zilpo/zilpo/issues"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Report this issue
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
