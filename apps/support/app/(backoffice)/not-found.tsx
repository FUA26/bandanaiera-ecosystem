import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { AlertCircle, ArrowLeft, Home, Search, FileX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-md animate-in flex-col items-center text-center duration-500 fade-in slide-in-from-bottom-4">
        {/* Icon with decorative ring */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10 blur-xl" />
          <div className="relative flex size-24 items-center justify-center rounded-2xl border border-border bg-card shadow-lg">
            <FileX className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Page not found
        </h1>

        {/* Description */}
        <p className="mt-4 max-w-sm text-lg text-muted-foreground">
          The page you're looking for doesn't exist or has been moved to a
          different location.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          <Button asChild variant="default" size="lg" className="flex-1 gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1 gap-2">
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault()
                window.history.back()
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Additional help */}
        <div className="mt-8 w-full max-w-sm rounded-xl border border-border bg-card/50 p-6 text-left">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                Looking for something specific?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try using the search bar or navigate through the sidebar to find
                what you need.
              </p>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
          <span className="text-muted-foreground">Quick links:</span>
          <Link
            href="/access-management/users"
            className="text-primary underline-offset-4 hover:underline"
          >
            Users
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link
            href="/access-management/roles"
            className="text-primary underline-offset-4 hover:underline"
          >
            Roles
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link
            href="/settings"
            className="text-primary underline-offset-4 hover:underline"
          >
            Settings
          </Link>
        </div>
      </div>
    </div>
  )
}
