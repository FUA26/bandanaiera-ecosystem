"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
  SidebarSeparator,
} from "@workspace/ui/components/sidebar"
import { usePermissions } from "@/lib/rbac-client/provider"
import { AppSwitcher } from "@/components/dashboard/app-switcher"
import { getAppIdentity } from "@/lib/config/app-identity"
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  Shield,
  Key,
  Settings,
  LifeBuoy,
  Bell,
} from "lucide-react"

const navItems = [
  // Overview Group
  { heading: "Overview" },
  { href: "/", label: "Dashboard", icon: LayoutDashboard, permission: null },

  // Work Management Group
  { heading: "Work" },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, permission: null },
  {
    href: "/tickets",
    label: "Tickets",
    icon: LifeBuoy,
    permission: "TICKET_VIEW_ALL",
  },
  {
    href: "/apps",
    label: "Apps",
    icon: FolderKanban,
    permission: "TICKET_APP_VIEW",
  },

  // User & Access Management Group
  { heading: "Users & Access" },
  {
    href: "/access-requests",
    label: "Access Requests",
    icon: Bell,
    permission: "TICKET_APP_APPROVE",
  },
  {
    href: "/manage/users",
    label: "Users",
    icon: Users,
    permission: "ADMIN_USERS_MANAGE",
  },
  {
    href: "/manage/roles",
    label: "Roles",
    icon: Shield,
    permission: "ADMIN_ROLES_MANAGE",
  },
  {
    href: "/manage/permissions",
    label: "Permissions",
    icon: Key,
    permission: "ADMIN_PERMISSIONS_MANAGE",
  },

  // Settings Group
  { heading: "Settings" },
  {
    href: "/manage/system-settings",
    label: "System Settings",
    icon: Settings,
    permission: "ADMIN_SYSTEM_SETTINGS_MANAGE",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const userPermissions = usePermissions()
  const appIdentity = getAppIdentity()
  const AppIcon = appIdentity.icon

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true
    return userPermissions?.permissions.includes(item.permission)
  })

  // Filter out headings if they have no items
  const finalNavItems = filteredNavItems.filter((item, index, array) => {
    if (!("heading" in item)) return true

    const nextHeadingIndex = array.findIndex(
      (i, idx) => idx > index && "heading" in i
    )
    const itemsAfterHeading = array.slice(
      index + 1,
      nextHeadingIndex === -1 ? undefined : nextHeadingIndex
    )

    return itemsAfterHeading.some((i) => !("heading" in i))
  })

  // Group navigation items by their headings
  const groupedItems = finalNavItems.reduce(
    (groups, item) => {
      if ("heading" in item) {
        groups.push({ heading: item.heading, items: [] })
      } else {
        const currentGroup = groups[groups.length - 1]
        if (currentGroup) {
          currentGroup.items.push(item)
        }
      }
      return groups
    },
    [] as Array<{ heading?: string; items: typeof navItems }>
  )

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href)
  }

  return (
    <Sidebar>
      {/* Header - App Branding */}
      <SidebarHeader className="border-b border-sidebar-border/50 px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-sidebar-accent/50"
            >
              <Link href="/" className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-primary shadow-none">
                  <AppIcon
                    className="size-5 text-sidebar-primary"
                    strokeWidth={2.5}
                  />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-sidebar-foreground">
                    {appIdentity.shortName}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    {appIdentity.tagline}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 pt-2">
        <nav aria-label="Main navigation" className="flex flex-col gap-5">
          {groupedItems.map((group, idx) => (
            <SidebarGroup key={idx}>
              {group.heading && (
                <SidebarGroupLabel className="px-2 py-1.5 text-[11px] tracking-[0.16em] text-muted-foreground/80 uppercase">
                  {group.heading}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    if ("heading" in item) return null
                    const active = isActive(item.href)
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          aria-current={active ? "page" : undefined}
                          className={
                            active
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-none hover:bg-sidebar-primary/90"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                          }
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-3"
                          >
                            <item.icon
                              className={
                                active
                                  ? "size-4 text-sidebar-primary-foreground"
                                  : "size-4 text-sidebar-foreground/55"
                              }
                            />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>

        <SidebarSeparator className="mx-0 my-4" />

        <div className="px-0 pb-1">
          <AppSwitcher />
        </div>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border/50 px-3 py-3">
        <div className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/70">
          <span className="font-medium text-sidebar-foreground/80">
            {appIdentity.name}
          </span>
          <span>v{appIdentity.version}</span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
