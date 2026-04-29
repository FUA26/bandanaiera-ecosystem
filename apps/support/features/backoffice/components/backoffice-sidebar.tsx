"use client"

import * as React from "react"

import { NavMain } from "@/features/backoffice/components/nav-main"
import { TeamSwitcher } from "@/features/backoffice/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import { BarChartIcon, ShieldCheckIcon, SettingsIcon } from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <BarChartIcon />,
    },
    {
      title: "Access Management",
      icon: <ShieldCheckIcon />,
      items: [
        {
          title: "Users",
          url: "/access-management/users",
        },
        {
          title: "Roles",
          url: "/access-management/roles",
        },
        {
          title: "Permissions",
          url: "/access-management/permissions",
        },
      ],
    },
    {
      title: "Configuration",
      icon: <SettingsIcon />,
      items: [
        {
          title: "Settings",
          url: "/settings",
        },
      ],
    },
  ],
}

export function BackofficeSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
