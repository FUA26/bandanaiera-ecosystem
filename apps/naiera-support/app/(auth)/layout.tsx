import type { ReactNode } from "react"
import Link from "next/link"

import { FloatingPaths } from "@/components/floating-paths"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh overflow-hidden lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-auth-gradient-from via-auth-gradient-via to-auth-gradient-to p-8 md:p-12 lg:p-16">
        <div className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-20">
          <FloatingPaths position={1} />
        </div>

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-heading font-semibold text-auth-heading transition-opacity hover:opacity-70"
          >
            <div className="flex size-8 items-center justify-center rounded-xl bg-auth-brand-light text-auth-brand-dark shadow-lg shadow-primary/20">
              <span className="text-sm font-bold">Z</span>
            </div>
            <span className="text-lg">Bandanaiera</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="font-heading text-3xl leading-[1.15] font-bold tracking-tight text-auth-heading md:text-4xl lg:text-5xl">
            Kelola dukungan
            <br />
            dengan lebih cepat
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-auth-subtle md:text-auth-muted">
            Masuk untuk menangani tiket, menindaklanjuti laporan, dan menjaga
            operasional bantuan tetap rapi dalam satu tempat.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-auth-subtle">
          <div className="flex items-center gap-2 rounded-full border border-auth-badge-border bg-auth-badge-bg px-3 py-1.5 shadow-sm">
            <div className="size-1.5 rounded-full bg-auth-brand-light" />
            <span className="font-medium">Tiket masuk</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-auth-badge-border bg-auth-badge-bg px-3 py-1.5 shadow-sm">
            <div className="size-1.5 rounded-full bg-auth-brand-light" />
            <span className="font-medium">Respons cepat</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-auth-badge-border bg-auth-badge-bg px-3 py-1.5 shadow-sm">
            <div className="size-1.5 rounded-full bg-auth-brand-light" />
            <span className="font-medium">Akses aman</span>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col justify-center bg-auth-form-bg p-6 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,auth-radial-gradient_0%,transparent_100%)] md:p-10 lg:p-12">
        <div className="mb-8 lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-heading font-semibold"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-auth-brand-light text-auth-brand-dark">
              <span className="text-xs font-bold">Z</span>
            </div>
            <span>Bandanaiera</span>
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-in duration-700 fade-in slide-in-from-bottom-4">
          {children}
        </div>
      </div>
    </div>
  )
}
