"use client"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import { Header } from "./header"
import { CommandDialog } from "./search-command/command-dialog"
import { AppSidebar } from "./layout/app-sidebar"

interface DashboardLayoutProps {
  user: {
    email?: string | null
    name?: string | null
    avatarId?: string | null
    role?: {
      name: string
    } | null
  }
  children: React.ReactNode
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar/95 text-sidebar-foreground backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 supports-[backdrop-filter]:bg-sidebar/85">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/backoffice">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 px-4 py-6">
            <Header user={user} />
          </div>
        </header>
        <main className="flex min-w-0 flex-1 flex-col bg-background">
          <div className="min-w-0 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </SidebarInset>
      <CommandDialog />
    </SidebarProvider>
  )
}
