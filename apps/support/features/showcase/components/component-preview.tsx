"use client"

import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

interface ComponentPreviewProps {
  children: React.ReactNode
  className?: string
}

export function ComponentPreview({
  children,
  className,
}: ComponentPreviewProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Preview
        </span>
        <Button
          size="icon-xs"
          variant="ghost"
          onClick={toggleTheme}
          className="size-7"
        >
          {theme === "light" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
      </div>
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border transition-colors",
          theme === "light"
            ? "border-border bg-background"
            : "border-gray-800 bg-gray-950"
        )}
      >
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
