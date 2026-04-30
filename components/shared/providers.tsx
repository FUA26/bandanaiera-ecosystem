"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider } from "jotai"
import { type Session } from "next-auth"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { useEffect, useState, type ComponentProps, type ReactNode } from "react"

function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (!event.key || event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export function Providers({
  children,
  session,
}: {
  children: ReactNode
  session?: Session | null
}) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <NextAuthSessionProvider session={session}>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </NextAuthSessionProvider>
      </Provider>
    </QueryClientProvider>
  )
}
