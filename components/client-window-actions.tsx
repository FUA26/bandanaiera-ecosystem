"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

type WindowActionKind = "reload" | "close"

interface WindowActionButtonProps {
  action: WindowActionKind
  children: React.ReactNode
  className?: string
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive"
  showReloadIcon?: boolean
}

export function WindowActionButton({
  action,
  children,
  className,
  variant = "default",
  showReloadIcon = false,
}: WindowActionButtonProps) {
  const handleClick = () => {
    if (action === "reload") {
      window.location.reload()
      return
    }

    window.close()
  }

  return (
    <Button onClick={handleClick} variant={variant} className={className}>
      {showReloadIcon ? <RefreshCw className="h-4 w-4" /> : null}
      {children}
    </Button>
  )
}
