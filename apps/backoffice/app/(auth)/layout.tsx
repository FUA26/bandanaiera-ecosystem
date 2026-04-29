import { Check } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Left Column - Auth Forms */}
      <div className="relative z-10 flex h-full flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">{children}</div>
      </div>

      {/* Right Column - Hero */}
      <div className="to-info relative hidden w-full flex-col justify-center overflow-hidden bg-gradient-to-br from-primary px-4 py-12 sm:px-6 lg:flex lg:px-20 xl:px-24">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="bg-primary-light animate-blob absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-40 mix-blend-overlay blur-3xl filter"></div>
        <div className="bg-info animate-blob animation-delay-2000 absolute top-0 -right-4 h-96 w-96 rounded-full opacity-30 mix-blend-overlay blur-3xl filter"></div>

        <div className="relative z-10 max-w-md space-y-8 text-white">
          <h1 className="text-4xl leading-tight font-bold tracking-tight">
            Akses Semua Layanan dalam Satu Aplikasi
          </h1>
          <p className="text-lg leading-relaxed font-medium text-primary-foreground/90">
            Lebih dari 100+ layanan operasional siap melayani Anda 24/7 dengan
            cepat, mudah, dan aman.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-primary-foreground/80" />
              <span className="text-primary-foreground">
                E-KTP, KK, dan layanan kependudukan
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-primary-foreground/80" />
              <span className="text-primary-foreground">
                Pembayaran pajak dan retribusi online
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-primary-foreground/80" />
              <span className="text-primary-foreground">
                Perizinan usaha dan IMB
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-primary-foreground/80" />
              <span className="text-primary-foreground">
                Layanan kesehatan dan pendidikan
              </span>
            </div>
          </div>

          <div className="mt-12 transform rounded-2xl border border-white/20 bg-white/10 p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-md transition duration-300 hover:scale-[1.02]">
            <p className="mb-1 text-sm font-medium text-primary-foreground/80">
              Dipercaya oleh
            </p>
            <p className="text-3xl font-bold tracking-tight text-white">
              50.000+ Pengguna
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
