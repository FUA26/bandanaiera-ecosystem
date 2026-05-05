"use client"

import { Search } from "lucide-react"
import { Bell } from "lucide-react"
import { UserDropdown } from "./user-dropdown"
import { CommandDialogTrigger } from "./search-command/command-dialog-trigger"
import { NotificationsTrigger } from "./notifications/notifications-trigger"

interface HeaderProps {
  user: {
    email?: string | null
    name?: string | null
    avatarId?: string | null
    role?: {
      name: string
    } | null
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <CommandDialogTrigger className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <Search className="size-4" />
        <span className="sr-only">Search</span>
      </CommandDialogTrigger>
      <NotificationsTrigger className="relative inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <Bell className="size-4" />
        <span className="sr-only">Notifications</span>
      </NotificationsTrigger>
      <UserDropdown user={user} />
    </div>
  )
}
