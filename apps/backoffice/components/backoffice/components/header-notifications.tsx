"use client"

import * as React from "react"
import {
  BellIcon,
  CheckIcon,
  UserIcon,
  ShoppingCartIcon,
  PackageIcon,
  AlertTriangleIcon,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"

const notifications = [
  {
    id: "1",
    title: "New user registration",
    description: "John Doe signed up 2 hours ago",
    time: "2 hours ago",
    icon: <UserIcon className="size-4" />,
    read: false,
  },
  {
    id: "2",
    title: "Order placed",
    description: "Order #1234 awaiting processing",
    time: "3 hours ago",
    icon: <ShoppingCartIcon className="size-4" />,
    read: false,
  },
  {
    id: "3",
    title: "Low stock alert",
    description: "Widget X has 3 remaining",
    time: "5 hours ago",
    icon: <AlertTriangleIcon className="size-4" />,
    read: true,
  },
  {
    id: "4",
    title: "Product updated",
    description: "Widget Y inventory changed",
    time: "1 day ago",
    icon: <PackageIcon className="size-4" />,
    read: true,
  },
]

export function HeaderNotifications() {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <BellIcon className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 rounded-lg"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="flex items-center justify-between px-4">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          <DropdownMenuGroup>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 px-4 py-3"
                >
                  <div className="flex w-full items-start gap-3">
                    <div className="mt-0.5 shrink-0 text-muted-foreground">
                      {notification.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {notification.time}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs text-muted-foreground"
                          >
                            <CheckIcon className="mr-1 size-3" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {notification.id !==
                    notifications[notifications.length - 1]?.id && (
                    <Separator className="mt-2" />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
