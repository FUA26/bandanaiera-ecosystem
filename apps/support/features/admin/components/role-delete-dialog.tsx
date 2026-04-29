// apps/support/features/admin/components/role-delete-dialog.tsx
"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface RoleDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleId: string
  roleName: string
  userCount: number
  onSuccess: () => void
}

export function RoleDeleteDialog({
  open,
  onOpenChange,
  roleId,
  roleName,
  userCount,
  onSuccess,
}: RoleDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (userCount > 0) {
      toast.error(
        "Cannot delete role with assigned users. Please reassign users first."
      )
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.message || "Failed to delete role")
      }

      toast.success("Role deleted successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to delete role:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to delete role"
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Role</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{roleName}</strong>?
            {userCount > 0 && (
              <span className="mt-2 block text-destructive">
                This role is assigned to {userCount} user
                {userCount > 1 ? "s" : ""}. You cannot delete a role with
                assigned users.
              </span>
            )}
            {userCount === 0 && (
              <span className="mt-2 block">This action cannot be undone.</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || userCount > 0}
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Role"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
