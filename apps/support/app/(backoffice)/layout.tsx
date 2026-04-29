"use client"

import { BackofficeSidebar } from "@/features/backoffice/components/backoffice-sidebar"
import { HeaderNavUser } from "@/features/backoffice/components/header-nav-user"
import {
  HeaderSearch,
  HeaderSearchMobile,
} from "@/features/backoffice/components/header-search"
import { HeaderNotifications } from "@/features/backoffice/components/header-notifications"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { BreadcrumbConsumer } from "@/lib/breadcrumb-context"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

// Breadcrumb configuration for each route
// Sections define top-level menu items (no parent link shown)
const breadcrumbConfig: Record<
  string,
  { label: string; parent?: string; isSection?: boolean }
> = {
  "/": { label: "Dashboard", isSection: true },
  "/access-management": { label: "Access Management", isSection: true },
  "/access-management/users": {
    label: "Users",
    parent: "/access-management",
  },
  "/access-management/roles": {
    label: "Roles",
    parent: "/access-management",
  },
  "/access-management/permissions": {
    label: "Permissions",
    parent: "/access-management",
  },
  "/settings": { label: "Settings", isSection: true },
}

// Generate breadcrumb items from pathname
function generateBreadcrumb(pathname: string) {
  const items: Array<{ label: string; href?: string; isCurrent: boolean }> = []

  // Build breadcrumb chain by walking up from current page
  let currentPath = pathname
  const pathChain: Array<{ path: string; isSection: boolean }> = []

  while (currentPath) {
    const config = breadcrumbConfig[currentPath]
    if (config) {
      pathChain.unshift({ path: currentPath, isSection: !!config.isSection })
      // Stop at section level (don't include Dashboard as prefix)
      if (config.isSection) {
        break
      }
      currentPath = config.parent || ""
    } else {
      break
    }
  }

  // Convert path chain to breadcrumb items
  pathChain.forEach((item, index) => {
    const config = breadcrumbConfig[item.path]
    const isLast = index === pathChain.length - 1

    if (config) {
      items.push({
        label: config.label,
        href: isLast ? undefined : item.path,
        isCurrent: isLast,
      })
    }
  })

  // Fallback for root/dashboard
  if (items.length === 0 && pathname === "/") {
    items.push({ label: "Dashboard", isCurrent: true })
  }

  return items
}

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const dynamicBreadcrumb = (
    <Breadcrumb>
      <BreadcrumbList>
        {generateBreadcrumb(pathname).map((item, index) => (
          <Fragment key={index}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )

  return (
    <SidebarProvider>
      <BackofficeSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-header transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <BreadcrumbConsumer fallback={dynamicBreadcrumb} />
          </div>
          <div className="flex items-center gap-2 px-4">
            <HeaderSearch />
            <HeaderSearchMobile />
            <HeaderNotifications />
            <HeaderNavUser />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 pt-0 sm:gap-6 sm:p-6 lg:px-8">
          <div className="max-w-8xl mx-auto w-full">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
