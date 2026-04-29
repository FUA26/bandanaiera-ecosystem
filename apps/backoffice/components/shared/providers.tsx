"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider } from "jotai"
import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { useEffect, useState } from "react"

function ThemeHotkeys() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target as HTMLElement | null
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable

      if (isTypingTarget) return

      if (event.key.toLowerCase() === "d") {
        event.preventDefault()
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark")
        window.dispatchEvent(new Event("storage"))
      }
    }

    document.addEventListener("keydown", handleKeyDown, true)
    return () => document.removeEventListener("keydown", handleKeyDown, true)
  }, [])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeHotkeys />
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  )
}
