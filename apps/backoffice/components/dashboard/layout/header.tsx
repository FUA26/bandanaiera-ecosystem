import Link from "next/link"
import { Github } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <img
              src="/images/logo_bandanaiera.png"
              alt="Zilpo logo"
              className="h-7 w-7 object-contain"
            />
          </div>
          <span className="hidden font-bold sm:inline-block">Zilpo Admin</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/docs"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Documentation
          </Link>
          <Link
            href="/components"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Components
          </Link>
          <Link
            href="/examples"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Examples
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="https://github.com/yourusername/boilerplate"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>

          <ThemeToggle />

          <Button size="sm" variant="ghost" className="hidden sm:flex" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>

          <Button size="sm" className="hidden sm:flex" asChild>
            <Link href="/auth/register">Sign Up</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
