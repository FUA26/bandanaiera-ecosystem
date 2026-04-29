import { ShowcaseSidebar } from "@/features/showcase/components/showcase-sidebar"

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh">
      <ShowcaseSidebar />
      <main className="flex-1 lg:ml-64">{children}</main>
    </div>
  )
}
