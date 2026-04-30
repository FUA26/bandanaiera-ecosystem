import { Suspense } from "react"
import { TicketDetailPublic } from "./components/ticket-detail-public"
import { Loader2, AlertCircle, Clock } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function PublicTicketDetailPage(props: PageProps) {
  const searchParams = await props.searchParams
  const token = searchParams.token

  // Token is required for access
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">Akses Ditolak</h1>
                <p className="mt-2 text-muted-foreground">
                  Token akses tidak tersedia. Halaman ini hanya dapat diakses
                  melalui aplikasi terintegrasi.
                </p>
              </div>

              <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-left">
                <p className="text-sm font-medium">Cara mengakses tiket:</p>
                <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Buka aplikasi terintegrasi Anda</li>
                  <li>Menuju halaman "Support" atau "Bantuan"</li>
                  <li>Pilih tiket yang ingin dilihat</li>
                </ol>
              </div>

              <Button
                onClick={() => window.close()}
                variant="outline"
                className="w-full"
              >
                Tutup Halaman
              </Button>

              <p className="text-xs text-muted-foreground">
                Jika Anda yakin seharusnya memiliki akses, silakan hubungi tim
                support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <TicketDetailPublic ticketId={(await props.params).id} token={token} />
      </Suspense>
    </div>
  )
}
