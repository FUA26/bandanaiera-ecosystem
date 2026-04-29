"use client"

import { Button } from "@workspace/ui/components/button"
import { TerminalBlock } from "./terminal-block"
import { ArrowRight } from "lucide-react"
import { siteConfig } from "@/lib/site-config"

export function HeroSection() {
  return (
    <section className="min-h-[90vh] px-4 py-16 sm:px-6 sm:py-20 md:py-28 lg:py-32">
      <div className="container grid lg:grid-cols-12 lg:gap-16">
        {/* Left: Content - asymmetric placement */}
        <div className="lg:col-span-7 lg:col-start-1">
          {/* Badge pill */}
          <div className="mb-6 inline-flex animate-in items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs duration-500 fade-in slide-in-from-top-2 sm:mb-8 sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-muted-foreground">Next.js 16 + React 19</span>
          </div>

          {/* Main headline - left aligned, more breathing room */}
          <h1 className="heading-display max-w-2xl animate-in text-balance delay-100 duration-700 fade-in slide-in-from-bottom-4">
            Skip boilerplate.
            <br />
            <span className="text-primary">Ship features.</span>
            <br />
            Scale confidently.
          </h1>

          {/* Subtext with more character limit for readability */}
          <p className="text-body-lg mt-8 max-w-xl animate-in text-balance text-muted-foreground delay-200 duration-700 fade-in slide-in-from-bottom-4">
            A modern SaaS starter template with production-ready patterns. No
            weeks of setup—just clone and start building.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex animate-in flex-col gap-3 delay-300 duration-700 fade-in slide-in-from-bottom-4 sm:mt-10 sm:flex-row sm:gap-4">
            <Button size="lg" className="group" asChild>
              <a href={siteConfig.nav.docs}>
                Start Building
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href={siteConfig.nav.docs}>See the Code</a>
            </Button>
          </div>

          {/* Trust indicators - unique icons instead of generic checkmarks */}
          <div className="mt-12 flex animate-in flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground delay-500 duration-700 fade-in slide-in-from-bottom-4 sm:mt-16 sm:gap-x-8 sm:gap-y-4 sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                <span className="text-[10px] font-bold text-primary">TS</span>
              </div>
              <span>TypeScript Strict</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                <span className="text-[10px] font-bold text-primary">TR</span>
              </div>
              <span>Turborepo Monorepo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                <span className="text-[10px] font-bold text-primary">UI</span>
              </div>
              <span>shadcn/ui Components</span>
            </div>
          </div>
        </div>

        {/* Right: Terminal - visually interesting placement */}
        <div className="mt-12 lg:col-span-5 lg:col-start-9 lg:mt-0 lg:flex lg:items-center">
          <div className="relative animate-in delay-200 duration-700 fade-in slide-in-from-right-8">
            {/* Decorative background glow */}
            <div className="absolute -inset-3 rounded-xl bg-primary/5 blur-xl sm:-inset-4" />

            <TerminalBlock
              className="relative text-xs sm:text-sm"
              showCopy={false}
            >
              {
                "$ npx create-zilpo my-app\n✓ Cloned template\n✓ Installed dependencies  \n✓ Dev server running\n\n→ Ready to ship at localhost:3000"
              }
            </TerminalBlock>

            {/* Floating badge - tech stack indicator */}
            <div className="absolute -right-3 -bottom-3 animate-in rounded-lg bg-background p-2.5 shadow-md delay-500 duration-500 zoom-in-95 fade-in sm:-right-4 sm:-bottom-4 sm:p-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 sm:h-6 sm:w-6">
                  <span className="text-[10px] font-bold text-primary sm:text-xs">
                    16
                  </span>
                </div>
                <span className="text-xs font-medium sm:text-sm">
                  Next.js ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
