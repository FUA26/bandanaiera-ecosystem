"use client"

import { Folder, MoreHorizontal, Settings, Share2 } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"

export function NavProjects({
  projects,
}: {
  projects: Array<{
    name: string
    url: string
    slug: string
  }>
}) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()

  if (!projects || projects.length === 0) {
    return null
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:p-0">
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground group-data-[collapsible=icon]/sidebar-wrapper:hidden">
        Projects
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {projects.map((item, index) => {
            const isActive =
              pathname === item.url || pathname.startsWith(item.url + "/")
            return (
              <SidebarMenuItem
                key={item.slug}
                className="menu-item-enter"
                style={
                  {
                    "--animation-delay": `${index * 50}ms`,
                  } as any
                }
              >
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                >
                  <Link href={item.url} className="gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-accent/50 text-xs font-semibold">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More actions</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem asChild>
                      <Link href={item.url} className="cursor-pointer text-sm">
                        <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>View Project</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`${item.url}/install`}
                        className="cursor-pointer text-sm"
                      >
                        <Share2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Installation</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={`${item.url}/settings`}
                        className="cursor-pointer text-sm"
                      >
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
