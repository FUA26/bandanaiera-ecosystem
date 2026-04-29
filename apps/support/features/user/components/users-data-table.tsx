"use client"

/**
 * Users Data Table Component
 *
 * Enhanced table with sorting, filtering, pagination, and bulk actions
 * Using the shared data-table components for reusability across other tables
 */

import { DataTable } from "@workspace/ui/components/data-table/data-table"
import { DataTableActionBar } from "@workspace/ui/components/data-table/data-table-action-bar"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header"
import { DataTableFacetedFilter } from "@workspace/ui/components/data-table/data-table-faceted-filter"
import { DataTableViewOptions } from "@workspace/ui/components/data-table/data-table-view-options"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { type ColumnDef } from "@tanstack/react-table"
import {
  EyeIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { UserDialog } from "./user-dialog"
import { UserDetailDialog } from "./user-detail-dialog"
import { formatRoleLabel } from "@/lib/rbac/role-labels"

// Types
export interface User {
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

interface UsersDataTableProps {
  /** Optional page number for server-side pagination */
  page?: number
  /** Optional page size for server-side pagination */
  pageSize?: number
}

interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

// Role filter options - these should come from API in production
const roleOptions = [
  { label: "Admin", value: "ADMIN" },
  { label: "Moderator", value: "MODERATOR" },
  { label: "User", value: "USER" },
]

export function UsersDataTable({
  page = 1,
  pageSize = 10,
}: UsersDataTableProps) {
  const [users, setUsers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const [editDialog, setEditDialog] = React.useState<{
    open: boolean
    userId: string
  }>({
    open: false,
    userId: "",
  })
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean
    user: User | null
  }>({
    open: false,
    user: null,
  })
  const [detailDialog, setDetailDialog] = React.useState<{
    open: boolean
    userId: string
  }>({
    open: false,
    userId: "",
  })
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })

      const response = await fetch(`/api/users?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data: UsersResponse = await response.json()
      setUsers(data.users)
    } catch {
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Handle delete
  const handleDelete = async () => {
    const user = deleteDialog.user
    if (!user) return

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      toast.success("User deleted successfully")
      setDeleteDialog({ open: false, user: null })
      fetchUsers()
    } catch {
      toast.error("Failed to delete user")
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async (userIds: string[]) => {
    try {
      await Promise.all(
        userIds.map((id) => fetch(`/api/users/${id}`, { method: "DELETE" }))
      )

      toast.success(
        `${userIds.length} user${userIds.length > 1 ? "s" : ""} deleted successfully`
      )
      fetchUsers()
    } catch {
      toast.error("Failed to delete users")
    }
  }

  // Get initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Column definitions
  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      size: 48,
      minSize: 48,
      maxSize: 48,
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="translate-y-[2px]"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          className="translate-y-[2px]"
          aria-label={`Select ${row.original.name || row.original.email}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      size: 240,
      minSize: 200,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary ring-2 ring-background/50">
            {getInitials(row.getValue("name"))}
          </div>
          <span className="font-medium">
            {row.getValue("name") || (
              <span className="text-muted-foreground">Unknown</span>
            )}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      size: 320,
      minSize: 240,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Email" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "role",
      size: 160,
      minSize: 140,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Role" />
      ),
      cell: ({ row }) => {
        const roleName = formatRoleLabel(row.original.role?.name)
        return (
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/5 text-xs font-medium"
          >
            {roleName}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const roleName = row.original.role?.name || "USER"
        return filterValue.includes(roleName)
      },
    },
    {
      accessorKey: "createdAt",
      size: 180,
      minSize: 160,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Created" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )
      },
    },
    {
      id: "actions",
      size: 72,
      minSize: 72,
      maxSize: 72,
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Actions for {user.name || user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDetailDialog({ open: true, userId: user.id })}
              >
                <EyeIcon className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditDialog({ open: true, userId: user.id })}
              >
                <PencilIcon className="mr-2 size-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteDialog({ open: true, user })}
              >
                <TrashIcon className="mr-2 size-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="rounded-md border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-0"
            >
              <div className="size-4 animate-pulse rounded bg-muted" />
              <div className="flex size-9 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              <div className="h-6 w-20 animate-pulse rounded bg-muted" />
              <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="size-8 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        toolbar={(table) => (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter users..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              <DataTableFacetedFilter
                title="Role"
                options={roleOptions}
                column={table.getColumn("role")}
                multiple
              />
            </div>
            <DataTableViewOptions table={table} />
            <Button
              size="sm"
              className="h-8"
              onClick={() => setCreateDialogOpen(true)}
            >
              <PlusIcon className="mr-2 size-4" />
              Add User
            </Button>
          </div>
        )}
        actionBar={(table) => (
          <DataTableActionBar table={table}>
            {(selectedUsers, resetSelection) => (
              <Button
                size="sm"
                className="h-8"
                variant="destructive"
                onClick={() => {
                  const selectedIds = selectedUsers.map((u) => u.id)
                  handleBulkDelete(selectedIds)
                  resetSelection()
                }}
              >
                <TrashIcon className="mr-2 size-4" />
                Delete ({selectedUsers.length})
              </Button>
            )}
          </DataTableActionBar>
        )}
      />

      {/* Dialogs */}
      <UserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={fetchUsers}
      />

      <UserDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, userId: "" })}
        mode="edit"
        userId={editDialog.userId}
        onSuccess={fetchUsers}
      />

      <UserDetailDialog
        open={detailDialog.open}
        onOpenChange={(open) =>
          setDetailDialog({ open, userId: open ? detailDialog.userId : "" })
        }
        userId={detailDialog.userId}
      />

      {/* Delete Confirm Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md animate-in rounded-lg border bg-background p-6 shadow-lg fade-in-0 zoom-in-95">
            <h3 className="text-lg font-semibold">Delete user account</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                {deleteDialog.user?.name || deleteDialog.user?.email}
              </strong>
              ? Their data will be permanently removed and this action cannot be
              undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ open: false, user: null })}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete user
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
