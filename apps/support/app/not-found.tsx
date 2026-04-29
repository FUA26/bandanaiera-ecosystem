import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { FloatingPaths } from "@/components/floating-paths"
import { ArrowLeft, Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      {/* Left: Brand content with animation */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-auth-gradient-from via-auth-gradient-via to-auth-gradient-to p-8 md:p-12 lg:p-16">
        <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20">
          <FloatingPaths position={1} />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-heading font-semibold text-auth-heading transition-opacity hover:opacity-70"
          >
            <div className="flex size-8 items-center justify-center rounded-xl bg-auth-brand-light text-auth-brand-dark shadow-lg shadow-primary/20">
              <span className="text-sm font-bold">Z</span>
            </div>
            <span className="text-lg">Zilpo</span>
          </Link>
        </div>

        {/* Error message */}
        <div className="relative z-10 max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-auth-badge-border bg-auth-badge-bg px-3 py-1.5 text-sm font-medium text-auth-subtle shadow-sm">
            <span>404</span>
          </div>
          <h1 className="font-heading text-3xl leading-[1.15] font-bold tracking-tight text-auth-heading md:text-4xl lg:text-5xl">
            Page not found
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-auth-subtle md:text-auth-muted">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track.
          </p>
        </div>

        {/* Tech stack badges */}
        <div className="relative z-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-auth-subtle">
          <div className="flex items-center gap-2 rounded-full border border-auth-badge-border bg-auth-badge-bg px-3 py-1.5 shadow-sm">
            <div className="size-1.5 rounded-full bg-auth-brand-light" />
            <span className="font-medium">Next.js 16</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-auth-badge-border bg-auth-badge-bg px-3 py-1.5 shadow-sm">
            <div className="size-1.5 rounded-full bg-auth-brand-light" />
            <span className="font-medium">React 19</span>
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
            <div className="flex size-8 items-center justify-center rounded-lg bg-auth-brand-light text-auth-brand-dark">
              <span className="text-xs font-bold">Z</span>
            </div>
            <span>Zilpo</span>
          </Link>
        </div>

        {/* Action cards */}
        <div className="relative mx-auto w-full max-w-sm animate-in duration-700 fade-in slide-in-from-bottom-4">
          <div className="flex flex-col gap-4">
            <Button
              asChild
              variant="default"
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
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <Link href="/sign-in">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-auth-form-bg px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="w-full gap-2 text-muted-foreground"
            >
              <Link href="https://github.com/zilpo/zilpo" target="_blank">
                <Search className="h-4 w-4" />
                Browse Documentation
              </Link>
            </Button>
          </div>

          {/* Help text */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Need help?{" "}
            <Link
              href="https://github.com/zilpo/zilpo/issues"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Report an issue
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
