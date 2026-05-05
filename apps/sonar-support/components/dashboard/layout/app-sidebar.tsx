"use client"

import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { NavMain } from "./nav-main"
import { navItemsConfig } from "./nav-items-config"
import { TeamSwitcher } from "../../backoffice/components/team-switcher"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm md:shadow-none"
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border bg-sidebar px-3 group-data-[collapsible=icon]:!h-12 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="px-3 py-2 group-data-[collapsible=icon]:px-2">
        <NavMain items={navItemsConfig} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
