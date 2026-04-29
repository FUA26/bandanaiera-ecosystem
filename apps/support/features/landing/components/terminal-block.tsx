"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Check, Copy } from "lucide-react"
import { useState } from "react"

interface TerminalBlockProps {
  children: string
  className?: string
  showCopy?: boolean
}

export function TerminalBlock({
  children,
  className,
  showCopy = true,
}: TerminalBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-muted p-3 font-mono text-sm sm:p-4",
        className
      )}
    >
      {showCopy && (
        <div className="absolute top-2 right-2 sm:top-2 sm:right-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 focus-visible:ring-2 focus-visible:ring-ring"
            onClick={handleCopy}
            aria-live="polite"
            aria-atomic="true"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span className="sr-only">Copied to clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="sr-only">Copy to clipboard</span>
              </>
            )}
          </Button>
        </div>
      )}
      <pre className="overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  )
}
