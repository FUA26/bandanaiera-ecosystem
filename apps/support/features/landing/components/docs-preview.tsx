"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Search, FileText, BookOpen, Layers, ArrowRight } from "lucide-react"
import Link from "next/link"
import { siteConfig } from "@/lib/site-config"

const docSections = [
  {
    icon: FileText,
    title: "Quick Start",
    items: ["Getting Started", "Installation", "Project Structure"],
  },
  {
    icon: BookOpen,
    title: "Features",
    items: ["Authentication", "Dashboard", "Components"],
  },
  {
    icon: Layers,
    title: "Architecture",
    items: ["Feature Structure", "Monorepo Setup", "Deployment"],
  },
]

export function DocsPreview() {
  return (
    <section className="border-t bg-muted/30 py-16 sm:py-20 md:py-24 lg:py-28">
      <div className="container">
        <div className="grid items-center lg:grid-cols-2 lg:gap-20">
          {/* Left: Content */}
          <div className="animate-in px-4 duration-700 fade-in slide-in-from-left-8 sm:px-6 lg:pr-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>Well documented</span>
            </div>
            <h2 className="heading-hero text-balance">
              Your team won&apos;t be guessing.
            </h2>
            <p className="text-body-lg mt-6 max-w-lg text-muted-foreground">
              Everything is documented. Every pattern explained. Every decision
              justified. Onboard new developers in minutes, not days.
            </p>

            <div className="text-body-sm mt-10 max-w-md space-y-4 text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <p>Comprehensive guides for every feature</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <p>Architecture decisions with rationale</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                <p>Best practices baked into the codebase</p>
              </div>
            </div>

            <div className="mt-10">
              <Button size="lg" variant="outline" className="group" asChild>
                <Link href={siteConfig.nav.docs}>
                  Explore the Docs
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Docs preview */}
          <div className="mt-12 animate-in px-4 delay-200 duration-700 fade-in slide-in-from-right-8 sm:px-6 lg:mt-0 lg:pl-12">
            <div className="rounded-2xl border bg-background p-4 shadow-xl sm:p-6">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  className="h-10 pl-10 sm:h-11"
                  disabled
                />
              </div>

              {/* Nav sections */}
              <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
                {docSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <div key={section.title}>
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Icon className="h-4 w-4 text-primary" />
                        {section.title}
                      </div>
                      <ul className="space-y-1">
                        {section.items.map((item) => (
                          <li key={item}>
                            <a
                              href="#"
                              className="block rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-all hover:bg-muted hover:pl-3 hover:text-foreground sm:px-3 sm:py-2 sm:hover:pl-4"
                            >
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>

              {/* Preview card */}
              <div className="mt-6 rounded-xl border bg-muted/50 p-4 sm:mt-8 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Authentication
                  </span>
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    Guide
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Learn how NextAuth.js v5 is configured in Pisky Admin,
                  including session management and security best practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
