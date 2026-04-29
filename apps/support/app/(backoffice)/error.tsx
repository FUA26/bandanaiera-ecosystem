"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug } from "lucide-react"
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
    console.error("Backoffice error:", error)
  }, [error])

  const errorMessage = getErrorMessage(
    error,
    "Something went wrong while loading this page"
  )

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-md animate-in flex-col items-center text-center duration-500 fade-in slide-in-from-bottom-4">
        {/* Icon with decorative ring */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-destructive/10 blur-xl" />
          <div className="relative flex size-24 items-center justify-center rounded-2xl border border-border bg-card shadow-lg">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="mt-4 max-w-sm text-lg text-muted-foreground">
          {errorMessage}. Please try again or contact support if the problem
          persists.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          <Button
            onClick={reset}
            variant="default"
            size="lg"
            className="flex-1 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1 gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        {/* Secondary action */}
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.history.back()
          }}
          className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Go back to previous page
        </Link>

        {/* Error details (dev only) */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 w-full rounded-xl border border-border bg-card/50 p-4 text-left">
            <summary className="cursor-pointer text-sm font-medium text-foreground hover:text-primary">
              Error Details
            </summary>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Message
                </p>
                <p className="mt-1 font-mono text-xs break-all text-foreground">
                  {error.message}
                </p>
              </div>
              {error.digest && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Digest
                  </p>
                  <p className="mt-1 font-mono text-xs text-foreground">
                    {error.digest}
                  </p>
                </div>
              )}
              {error.stack && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Stack Trace
                  </p>
                  <pre className="mt-1 overflow-x-auto rounded bg-background p-2 text-xs text-muted-foreground">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Report issue card */}
        <div className="mt-6 w-full max-w-sm rounded-xl border border-border bg-card/50 p-4 text-left">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Bug className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Found a bug?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Help us improve by reporting this issue on GitHub.
              </p>
              <Button
                asChild
                variant="link"
                size="sm"
                className="mt-2 h-auto p-0 text-primary"
              >
                <Link
                  href="https://github.com/zilpo/zilpo/issues"
                  target="_blank"
                  rel="noreferrer"
                >
                  Report Issue →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
