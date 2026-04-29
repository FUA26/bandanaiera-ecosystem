import { Geist_Mono, Inter, Manrope } from "next/font/google"

import "@workspace/ui/styles/globals.css"
import { Container } from "@workspace/ui/components/container"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata = {
  title: "Zilpo - Next.js SaaS Starter Template",
  description:
    "Ship faster with opinionated patterns. A modern Next.js 16 + React 16 SaaS starter template built with shadcn/ui.",
  keywords: ["Next.js", "SaaS", "starter", "template", "shadcn/ui"],
  authors: [{ name: "Zilpo" }],
  openGraph: {
    title: "Zilpo - Next.js SaaS Starter Template",
    description:
      "Ship faster with opinionated patterns. A modern Next.js 16 + React 16 SaaS starter template built with shadcn/ui.",
    type: "website",
    url: "https://zilpo.dev",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`antialiased ${fontMono.variable} ${manrope.variable} font-sans ${inter.variable}`}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <Container>{children}</Container>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
