import Link from "next/link"
import { siteConfig } from "@/lib/site-config"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container px-4 py-10 sm:px-6 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="group inline-flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
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
            <p className="max-w-xs text-sm text-muted-foreground">
              Skip the boilerplate. Ship features faster with production-ready
              patterns.
            </p>
            <div className="flex gap-2">
              <SocialLink href={siteConfig.github.url} ariaLabel="GitHub">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </SocialLink>
              <SocialLink href={siteConfig.twitter.url} ariaLabel="Twitter">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialLink>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h2 className="font-heading text-sm font-semibold">Product</h2>
            <ul className="space-y-2.5">
              <FooterLink href={siteConfig.nav.features}>Features</FooterLink>
              <FooterLink href={siteConfig.nav.docs}>Documentation</FooterLink>
              <FooterLink href={siteConfig.nav.changelog}>Changelog</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h2 className="font-heading text-sm font-semibold">Resources</h2>
            <ul className="space-y-2.5">
              <FooterLink href={siteConfig.nav.guides}>Guides</FooterLink>
              <FooterLink href={siteConfig.nav.examples}>Examples</FooterLink>
              <FooterLink href={siteConfig.nav.support}>Support</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border/40 pt-6 sm:flex-row sm:justify-between sm:gap-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} zilpo. Crafted for developers.
          </p>
          <p className="text-sm text-muted-foreground">
            <a
              href={siteConfig.github.url}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Star on GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {children}
      </Link>
    </li>
  )
}

function SocialLink({
  href,
  children,
  ariaLabel,
}: {
  href: string
  children: React.ReactNode
  ariaLabel: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
      aria-label={ariaLabel}
    >
      {children}
    </a>
  )
}
