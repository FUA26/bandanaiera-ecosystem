// apps/support/features/user/components/user-dialog.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { UserPlusIcon, PencilIcon } from "lucide-react"
import { UserForm } from "./user-form"

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  userId?: string
  onSuccess?: () => void
}

export function UserDialog({
  open,
  onOpenChange,
  mode,
  userId,
  onSuccess,
}: UserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([])
  const [initialData, setInitialData] = useState<{
    name?: string
    email?: string
    roleId?: string
  }>()

  useEffect(() => {
    if (!open) return

    let cancelled = false

    const load = async () => {
      try {
        const rolesResponse = await fetch("/api/roles")
        if (!rolesResponse.ok) throw new Error("Failed to fetch roles")
        const rolesData = await rolesResponse.json()
        if (!cancelled) {
          setRoles(rolesData.roles || [])
        }

        if (mode === "edit" && userId) {
          const userResponse = await fetch(`/api/users/${userId}`)
          if (!userResponse.ok) {
            const errorData = await userResponse
              .json()
              .catch(() => ({ error: "Unknown error" }))
            throw new Error(
              errorData.error || errorData.message || "Failed to fetch user"
            )
          }
          const data = await userResponse.json()
          if (!cancelled) {
            setInitialData({
              name: data.user.name || "",
              email: data.user.email,
              roleId: data.user.roleId,
            })
          }
        } else if (!cancelled) {
          setInitialData(undefined)
        }
      } catch (error) {
        console.error("Failed to load dialog data:", error)
        toast.error(
          error instanceof Error ? error.message : "Failed to load user data"
        )
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open, mode, userId])

  async function handleSubmit(
    data:
      | { name: string; email: string; roleId: string; password: string }
      | { name?: string; email?: string; roleId?: string; password?: string }
  ) {
    setIsLoading(true)
    try {
      const url = mode === "create" ? "/api/users" : `/api/users/${userId}`
      const method = mode === "create" ? "POST" : "PATCH"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.message || "Failed to save user")
      }

      toast.success(
        mode === "create"
          ? "User created successfully"
          : "User updated successfully"
      )
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save user:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to save user"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              {mode === "create" ? (
                <UserPlusIcon className="size-5 text-primary" />
              ) : (
                <PencilIcon className="size-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle>
                {mode === "create" ? "Create New User" : "Edit User"}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="pl-13">
            {mode === "create"
              ? "Add a new user to the system. They'll receive the permissions assigned to their role."
              : "Update user information and role assignment. Changes take effect immediately."}
          </DialogDescription>
        </DialogHeader>
        {initialData !== undefined || mode === "create" ? (
          <UserForm
            mode={mode}
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
            roles={roles}
          />
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading user data...
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
