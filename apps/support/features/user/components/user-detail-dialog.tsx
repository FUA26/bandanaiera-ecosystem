// apps/support/features/user/components/user-detail-dialog.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Label } from "@workspace/ui/components/label"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  CalendarIcon,
  ClockIcon,
  FingerprintIcon,
  ShieldIcon,
} from "lucide-react"
import { formatRoleLabel } from "@/lib/rbac/role-labels"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  roleId: string
  createdAt: string
  updatedAt: string
  role?: {
    id: string
    name: string
  }
}

interface UserDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

function getInitials(name: string | null) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UserDetailDialog({
  open,
  onOpenChange,
  userId,
}: UserDetailDialogProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open || !userId) return

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/users/${userId}`)
        if (!res.ok) {
          throw new Error("Failed to fetch user")
        }
        const data = await res.json()
        if (!cancelled) {
          setUser(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
        toast.error("Failed to load user details")
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open, userId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about this user account.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading user details...
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="flex items-center gap-4 rounded-xl bg-muted/30 p-4">
              <Avatar className="size-16 ring-4 ring-background">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold">
                  {user.name || "Unknown User"}
                </h3>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldIcon className="size-4 text-primary" />
                  <Label className="text-xs text-muted-foreground">Role</Label>
                </div>
                <Badge className="border-primary/20 bg-primary/5 text-foreground">
                  {formatRoleLabel(user.role?.name)}
                </Badge>
              </div>

              <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <FingerprintIcon className="size-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">
                    User ID
                  </Label>
                </div>
                <p className="font-mono text-xs break-all text-foreground">
                  {user.id}
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">
                    Created
                  </Label>
                </div>
                <p className="text-sm text-foreground">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-card/50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <ClockIcon className="size-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">
                    Last Updated
                  </Label>
                </div>
                <p className="text-sm text-foreground">
                  {new Date(user.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Failed to load user details
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
