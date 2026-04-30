"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar"
import Link from "next/link"
import { usePermissions } from "@/lib/rbac-client/provider"

function matchesPath(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    requiredPermission?: string
    items?: {
      title: string
      url: string
      requiredPermission?: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  const userPermissions = usePermissions()

  const hasWildcard = userPermissions?.permissions.includes("*") || false

  const hasPermission = (permission?: string) => {
    if (!permission) return true
    return (
      hasWildcard || userPermissions?.permissions.includes(permission) || false
    )
  }

  const filteredItems = items
    .filter((item) => hasPermission(item.requiredPermission))
    .map((item) => ({
      ...item,
      items: item.items?.filter((subItem) =>
        hasPermission(subItem.requiredPermission)
      ),
    }))
    .filter((item) => !item.items || item.items.length > 0)

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:p-0">
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground group-data-[collapsible=icon]/sidebar-wrapper:hidden">
        Platform
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {filteredItems.map((item, index) => {
            const hasSubItems = Boolean(item.items?.length)
            const isLeafActive = matchesPath(pathname, item.url)
            const isSubItemActive = item.items?.some((subItem) =>
              matchesPath(pathname, subItem.url)
            )
            const isItemActive = Boolean(
              item.isActive || isLeafActive || isSubItemActive
            )

            if (!hasSubItems) {
              return (
                <SidebarMenuItem
                  key={item.title}
                  className="menu-item-enter"
                  style={
                    {
                      "--animation-delay": `${index * 50}ms`,
                    } as any
                  }
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isItemActive}
                    asChild
                  >
                    <a
                      href={item.url}
                      className={cn(
                        "relative flex h-9 items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 ease-out",
                        "focus-visible:ring-2 focus-visible:ring-sidebar-ring/70 focus-visible:outline-none",
                        isItemActive
                          ? "bg-sidebar-primary/90 text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex size-4 shrink-0 items-center justify-center transition-all duration-200 ease-out [&_svg]:size-4",
                          isItemActive
                            ? "text-sidebar-primary-foreground"
                            : "text-sidebar-primary group-hover/link:scale-110 group-hover/link:text-sidebar-primary"
                        )}
                      >
                        <item.icon />
                      </span>
                      <span
                        className={cn(
                          "flex h-full min-w-0 flex-1 items-center truncate text-left text-sm leading-none",
                          isItemActive
                            ? "text-sidebar-primary-foreground"
                            : "group-hover/link:text-sidebar-primary"
                        )}
                      >
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }

            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isItemActive}
                className="group/collapsible"
              >
                <SidebarMenuItem
                  className="menu-item-enter"
                  style={
                    {
                      "--animation-delay": `${index * 50}ms`,
                    } as any
                  }
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isItemActive}
                      className={cn(
                        "transition-all duration-200 ease-out",
                        isItemActive &&
                          "bg-sidebar-primary/90 text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex size-4 shrink-0 items-center justify-center transition-all duration-200 ease-out [&_svg]:size-4",
                          isItemActive
                            ? "text-sidebar-primary-foreground"
                            : "text-sidebar-primary group-hover/menu-button:scale-110 group-hover/menu-button:text-sidebar-primary"
                        )}
                      >
                        <item.icon />
                      </span>
                      <span
                        className={cn(
                          "flex h-full min-w-0 flex-1 items-center truncate text-left text-sm leading-none",
                          isItemActive
                            ? "text-sidebar-primary-foreground"
                            : "group-hover/menu-button:text-sidebar-primary"
                        )}
                      >
                        {item.title}
                      </span>
                      <span
                        className={cn(
                          "inline-flex size-4 shrink-0 items-center justify-center transition-all duration-300 ease-out [&_svg]:size-4",
                          "text-muted-foreground",
                          isItemActive
                            ? "text-sidebar-primary-foreground/80"
                            : "group-hover/menu-button:text-sidebar-primary",
                          "group-data-[state=open]/collapsible:rotate-90"
                        )}
                      >
                        <ChevronRight />
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mt-1 px-2">
                      {item.items?.map((subItem, subIndex) => {
                        const subItemActive = matchesPath(pathname, subItem.url)

                        return (
                          <SidebarMenuSubItem
                            key={subItem.title}
                            className="sub-item-enter"
                            style={
                              {
                                "--animation-delay": `${subIndex * 40}ms`,
                              } as any
                            }
                          >
                            <SidebarMenuSubButton
                              tooltip={`${item.title} → ${subItem.title}`}
                              isActive={subItemActive}
                              asChild
                            >
                              <a
                                href={subItem.url}
                                aria-current={
                                  subItemActive ? "page" : undefined
                                }
                                className={cn(
                                  "relative flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-all duration-200 ease-out",
                                  "focus-visible:ring-2 focus-visible:ring-sidebar-ring/70 focus-visible:outline-none",
                                  subItemActive
                                    ? "bg-sidebar-primary/15 text-sidebar-primary shadow-sm before:absolute before:top-1/2 before:-left-3 before:h-8 before:w-0.5 before:-translate-y-1/2 before:rounded-r-full before:bg-sidebar-primary hover:bg-sidebar-primary/15 hover:text-sidebar-primary hover:shadow-sm"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                )}
                              >
                                <span
                                  className={cn(
                                    "transition-transform duration-200",
                                    subItemActive
                                      ? "text-sidebar-primary"
                                      : "group-hover/sublink:scale-105 group-hover/sublink:text-sidebar-primary"
                                  )}
                                >
                                  {subItem.title}
                                </span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
