"use client"

import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { TerminalBlock } from "./terminal-block"
import { ArrowRight, Copy, Check } from "lucide-react"
import { useState } from "react"
import { siteConfig } from "@/lib/site-config"

const gitCommands = `$ git clone ${siteConfig.github.url}.git
$ cd zilpo && pnpm install
$ pnpm dev

→ Ready to ship at localhost:3000`

export function CTASection() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(gitCommands)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="border-t bg-muted/30 py-16 sm:py-20 md:py-28 lg:py-36">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="animate-in px-4 text-center duration-700 fade-in slide-in-from-bottom-4 sm:px-6">
            <h2 className="heading-hero text-balance">Ready to build?</h2>
            <p className="text-body-lg mt-6 text-muted-foreground">
              Three commands. That&apos;s all it takes to get started.
            </p>
          </div>

          {/* Terminal - prominent display */}
          <div className="relative mx-auto mt-8 max-w-2xl animate-in delay-200 duration-500 zoom-in-95 fade-in sm:mt-12">
            {/* Decorative glow */}
            <div className="absolute -inset-2 -z-10 rounded-xl bg-primary/5 blur-xl sm:-inset-3" />

            <TerminalBlock className="text-xs sm:text-sm" showCopy={false}>
              {gitCommands}
            </TerminalBlock>

            {/* Copy button floating on terminal */}
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs font-medium shadow-md transition-all hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:top-4 sm:right-4 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
              aria-live="polite"
              aria-atomic="true"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-500 sm:h-4 sm:w-4" />
                  <span>Copied!</span>
                  <span className="sr-only">Commands copied to clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Copy</span>
                  <span className="sr-only">Copy commands to clipboard</span>
                </>
              )}
            </button>
          </div>

          {/* Primary action */}
          <div className="mt-8 flex animate-in justify-center delay-300 duration-700 fade-in slide-in-from-bottom-4 sm:mt-10">
            <Button size="lg" className="group" asChild>
              <Link href={siteConfig.nav.docs}>
                Explore Documentation
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Deploy options - simplified as links */}
          <div className="mt-8 animate-in delay-500 duration-700 fade-in slide-in-from-bottom-4 sm:mt-10">
            <p className="text-center text-xs text-muted-foreground sm:text-sm">
              One-click deploy to{" "}
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Vercel
              </a>
              ,{" "}
              <a
                href="https://railway.app/new"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Railway
              </a>
              , or{" "}
              <a
                href="https://netlify.com/drop"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Netlify
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
