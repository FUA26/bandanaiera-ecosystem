"use client"

/**
 * Roles Data Table Component
 *
 * Enhanced table with sorting, filtering, pagination, and bulk actions
 * Using the shared data-table components
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
  CopyIcon,
  EditIcon,
  MoreVerticalIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { RoleDeleteDialog } from "./role-delete-dialog"
import { RoleDialog } from "./role-dialog"

// Types
export interface Role {
  id: string
  name: string
  description: string | null
  permissions: string[]
  createdAt: string
  updatedAt: string
  _count?: {
    users: number
  }
}

interface RolesDataTableProps {
  roles: Role[]
  onRefresh: () => void
}

// Filter options for user count
const userCountOptions = [
  { label: "With users", value: "with-users" },
  { label: "Without users", value: "without-users" },
]

export function RolesDataTable({ roles, onRefresh }: RolesDataTableProps) {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialog, setEditDialog] = React.useState<{
    open: boolean
    roleId: string
  }>({
    open: false,
    roleId: "",
  })
  const [cloneDialog, setCloneDialog] = React.useState<{
    open: boolean
    roleId: string
  }>({
    open: false,
    roleId: "",
  })
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean
    roleId: string
    roleName: string
    userCount: number
  }>({
    open: false,
    roleId: "",
    roleName: "",
    userCount: 0,
  })
  // Handle bulk delete
  const handleBulkDelete = async (roleIds: string[]) => {
    try {
      await Promise.all(
        roleIds.map((id) => fetch(`/api/roles/${id}`, { method: "DELETE" }))
      )

      toast.success(
        `${roleIds.length} role${roleIds.length > 1 ? "s" : ""} deleted successfully`
      )
      onRefresh?.()
    } catch {
      toast.error("Failed to delete roles")
    }
  }

  // Column definitions
  const columns: ColumnDef<Role>[] = [
    {
      id: "select",
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
          aria-label={`Select ${row.original.name}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-medium">
            {row.getValue("name")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Description" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.description || (
            <span className="italic">No description</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "permissions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Permissions" />
      ),
      cell: ({ row }) => {
        const permissions = row.original.permissions || []
        return (
          <div className="flex flex-wrap gap-1">
            {permissions.length === 0 ? (
              <span className="text-sm text-muted-foreground italic">
                No permissions
              </span>
            ) : (
              <>
                {permissions.slice(0, 3).map((permission) => (
                  <Badge
                    key={permission}
                    variant="secondary"
                    className="text-xs"
                  >
                    {permission}
                  </Badge>
                ))}
                {permissions.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{permissions.length - 3} more
                  </Badge>
                )}
              </>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "users",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Users" />
      ),
      cell: ({ row }) => {
        const userCount = row.original._count?.users || 0
        return (
          <Badge
            variant={userCount > 0 ? "default" : "secondary"}
            className="font-mono"
          >
            {userCount}
          </Badge>
        )
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        const userCount = row.original._count?.users || 0
        if (filterValue.includes("with-users")) return userCount > 0
        if (filterValue.includes("without-users")) return userCount === 0
        return true
      },
    },
    {
      accessorKey: "createdAt",
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
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Actions for {role.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setEditDialog({ open: true, roleId: role.id })}
              >
                <EditIcon className="mr-2 size-4" />
                Edit Role
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setCloneDialog({ open: true, roleId: role.id })}
              >
                <CopyIcon className="mr-2 size-4" />
                Clone Role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() =>
                  setDeleteDialog({
                    open: true,
                    roleId: role.id,
                    roleName: role.name,
                    userCount: role._count?.users || 0,
                  })
                }
              >
                <TrashIcon className="mr-2 size-4" />
                Delete Role
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
    },
  ]

  return (
    <>
      <DataTable
        data={roles}
        columns={columns}
        toolbar={(table) => (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Filter roles..."
                value={
                  (table.getColumn("name")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
              <DataTableFacetedFilter
                title="Users"
                options={userCountOptions}
                column={table.getColumn("users")}
              />
            </div>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <Button
                size="sm"
                className="h-8"
                onClick={() => setCreateDialogOpen(true)}
              >
                <PlusIcon className="mr-2 size-4" />
                Add Role
              </Button>
            </div>
          </div>
        )}
        actionBar={(table) => (
          <DataTableActionBar table={table}>
            {(selectedRoles, resetSelection) => (
              <Button
                size="sm"
                className="h-8"
                variant="destructive"
                onClick={() => {
                  const selectedIds = selectedRoles.map((r) => r.id)
                  handleBulkDelete(selectedIds)
                  resetSelection()
                }}
              >
                <TrashIcon className="mr-2 size-4" />
                Delete ({selectedRoles.length})
              </Button>
            )}
          </DataTableActionBar>
        )}
      />

      {/* Dialogs */}
      <RoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={onRefresh}
      />

      <RoleDialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog({ open, roleId: open ? editDialog.roleId : "" })
        }
        mode="edit"
        roleId={editDialog.roleId}
        onSuccess={onRefresh}
      />

      <RoleDialog
        open={cloneDialog.open}
        onOpenChange={(open) =>
          setCloneDialog({ open, roleId: open ? cloneDialog.roleId : "" })
        }
        mode="clone"
        roleId={cloneDialog.roleId}
        onSuccess={onRefresh}
      />

      <RoleDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({
            open,
            roleId: open ? deleteDialog.roleId : "",
            roleName: open ? deleteDialog.roleName : "",
            userCount: open ? deleteDialog.userCount : 0,
          })
        }
        roleId={deleteDialog.roleId}
        roleName={deleteDialog.roleName}
        userCount={deleteDialog.userCount}
        onSuccess={onRefresh}
      />
    </>
  )
}
