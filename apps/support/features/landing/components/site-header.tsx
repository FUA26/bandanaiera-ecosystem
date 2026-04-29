"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"
import { Menu, Moon, Sun, X } from "lucide-react"
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react"
import { siteConfig } from "@/lib/site-config"

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement | null>(null)
  const firstFocusableRef = useRef<HTMLAnchorElement | null>(null)
  const lastFocusableRef = useRef<HTMLAnchorElement | null>(null)

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMenuOpen) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault()
          lastFocusableRef.current?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault()
          firstFocusableRef.current?.focus()
        }
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false)
        menuToggleRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleTab)
    document.addEventListener("keydown", handleEscape)

    // Focus first element when menu opens
    setTimeout(() => {
      firstFocusableRef.current?.focus()
    }, 0)

    // Return focus to toggle when menu closes
    return () => {
      document.removeEventListener("keydown", handleTab)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div
            className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="m19 19-7-7 7-7" />
            </svg>
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">
            zilpo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          <NavLink href={siteConfig.nav.features}>Features</NavLink>
          <NavLink href={siteConfig.nav.docs}>Docs</NavLink>
          <NavLink
            href={siteConfig.github.url}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="group relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </button>

          {/* CTA Button - Desktop */}
          <div className="hidden md:flex md:items-center md:gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={siteConfig.auth.signIn}>Sign in</Link>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
              <Link href={siteConfig.auth.signUp}>
                Start Building
                <svg
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            ref={menuToggleRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="group relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 transition-all" />
            ) : (
              <Menu className="h-5 w-5 transition-all" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            <MobileNavLink
              ref={firstFocusableRef}
              href={siteConfig.nav.features}
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </MobileNavLink>
            <MobileNavLink
              href={siteConfig.nav.docs}
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </MobileNavLink>
            <MobileNavLink
              href={siteConfig.github.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              GitHub
            </MobileNavLink>
            <div className="my-2 h-px bg-border/40" />
            <MobileNavLink
              href={siteConfig.auth.signIn}
              onClick={() => setIsMenuOpen(false)}
            >
              Sign in
            </MobileNavLink>
            <Button size="sm" className="mt-2 justify-center gap-1.5" asChild>
              <Link
                ref={lastFocusableRef}
                href={siteConfig.auth.signUp}
                onClick={() => setIsMenuOpen(false)}
              >
                Start Building
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}

function NavLink({
  href,
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className="relative rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
      {...props}
    >
      {children}
    </Link>
  )
}

const MobileNavLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<typeof Link> & { onClick?: () => void }
>(function MobileNavLink({ href, children, onClick, ...props }, ref) {
  return (
    <Link
      href={href}
      onClick={onClick}
      ref={ref}
      className="rounded-lg px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
      {...props}
    >
      {children}
    </Link>
  )
})
