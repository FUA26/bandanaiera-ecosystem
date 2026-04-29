import { Providers } from "@/components/shared/providers"
import { Toaster } from "@workspace/ui/components/sonner"
import type { Metadata } from "next"
import { Fira_Code, Inter, Merriweather } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
})

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${merriweather.variable} ${firaCode.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <Script
          src="https://cdn.jsdelivr.net/npm/eruda"
          strategy="afterInteractive"
        />
        <Script id="eruda-init" strategy="afterInteractive">
          {`if (window.eruda) {
            window.eruda.init();
          }`}
        </Script>
      </body>
    </html>
  )
}
