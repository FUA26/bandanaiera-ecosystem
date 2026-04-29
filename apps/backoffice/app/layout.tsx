import { Providers } from "@/components/shared/providers"
import { Toaster } from "@workspace/ui/components/sonner"
import type { Metadata } from "next"
import { Geist_Mono, Inter, Manrope } from "next/font/google"
import "@workspace/ui/globals.css"

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

export const metadata: Metadata = {
  title: {
    default: "Zilpo Admin",
    template: "%s | Zilpo Admin",
  },
  description: "Zilpo Admin dashboard for support and operations",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: "/logo.svg",
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
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
