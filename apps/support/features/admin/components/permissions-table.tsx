"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@workspace/ui/components/data-table/data-table"
import { DataTableActionBar } from "@workspace/ui/components/data-table/data-table-action-bar"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table/data-table-column-header"
import { DataTableFacetedFilter } from "@workspace/ui/components/data-table/data-table-faceted-filter"
import { DataTableViewOptions } from "@workspace/ui/components/data-table/data-table-view-options"
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
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  EditIcon,
  Loader2,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

import { PermissionDialog } from "./permission-dialog"

interface PermissionRecord {
  id: string
  name: string
  category: string
  description: string | null
  _count?: {
    rolePermissions: number
  }
}

interface PermissionsTableProps {
  data: PermissionRecord[]
  categories: string[]
  onRefresh: () => void
}

interface PermissionRow extends PermissionRecord {
  search: string
}

export function PermissionsTable({
  data,
  categories,
  onRefresh,
}: PermissionsTableProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] =
    useState<PermissionRecord | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permissionToDelete, setPermissionToDelete] =
    useState<PermissionRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const permissions = React.useMemo<PermissionRow[]>(
    () =>
      data.map((permission) => ({
        ...permission,
        search: [
          permission.name,
          permission.category,
          permission.description || "",
        ]
          .join(" ")
          .toLowerCase(),
      })),
    [data]
  )

  const handleSavePermission = async (data: {
    name: string
    category: string
    description?: string
  }) => {
    const url = editingPermission
      ? `/api/permissions/${editingPermission.id}`
      : "/api/permissions"
    const method = editingPermission ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(
        error.error || error.message || "Failed to save permission"
      )
    }

    toast.success(
      editingPermission ? "Permission updated" : "Permission created"
    )
    onRefresh()
  }

  const handleDelete = async (permission: PermissionRecord) => {
    setPermissionToDelete(permission)

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/permissions/${permission.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(
          error.error || error.message || "Failed to delete permission"
        )
      }

      toast.success("Permission deleted")
      onRefresh()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete permission:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to delete permission"
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const bulkDeletePermissions = async (
    selectedPermissions: PermissionRow[]
  ) => {
    const blocked = selectedPermissions.filter(
      (permission) => (permission._count?.rolePermissions ?? 0) > 0
    )

    if (blocked.length > 0) {
      toast.error(
        `Cannot delete ${blocked.length} permission${blocked.length > 1 ? "s" : ""} that are already assigned to roles.`
      )
      return false
    }

    try {
      await Promise.all(
        selectedPermissions.map((permission) =>
          fetch(`/api/permissions/${permission.id}`, { method: "DELETE" })
        )
      )

      toast.success(
        `${selectedPermissions.length} permission${selectedPermissions.length > 1 ? "s" : ""} deleted successfully`
      )
      onRefresh()
      return true
    } catch (error) {
      console.error("Failed to delete permissions:", error)
      toast.error("Failed to delete permissions")
      return false
    }
  }

  const columns: ColumnDef<PermissionRow>[] = React.useMemo(
    () => [
      {
        id: "select",
        size: 48,
        minSize: 48,
        maxSize: 48,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(checked) =>
              table.toggleAllPageRowsSelected(!!checked)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => row.toggleSelected(!!checked)}
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
          <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
            {row.getValue("name")}
          </code>
        ),
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Category" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">{row.getValue("category")}</Badge>
        ),
        filterFn: (row, columnId, filterValue: string[]) => {
          const category = row.getValue(columnId) as string
          if (!filterValue.length) return true
          return filterValue.includes(category)
        },
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Description" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.getValue("description") || "-"}
          </span>
        ),
      },
      {
        accessorKey: "usage",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Usage" />
        ),
        cell: ({ row }) => {
          const usageCount = row.original._count?.rolePermissions || 0
          return (
            <Badge
              variant={usageCount > 0 ? "default" : "secondary"}
              className="font-mono"
            >
              {usageCount}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const permission = row.original
          const usageCount = permission._count?.rolePermissions || 0

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                  <MoreVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Actions for {permission.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setEditingPermission(permission)
                    setDialogOpen(true)
                  }}
                >
                  <EditIcon className="mr-2 size-4" />
                  Edit Permission
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    setPermissionToDelete(permission)
                    setDeleteDialogOpen(true)
                  }}
                  disabled={usageCount > 0}
                >
                  <TrashIcon className="mr-2 size-4" />
                  Delete Permission
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "search",
        header: "Search",
        cell: () => null,
        enableHiding: false,
        enableSorting: false,
        filterFn: (row, columnId, filterValue: string) => {
          const haystack = (row.getValue(columnId) as string) || ""
          const needle = filterValue.trim().toLowerCase()
          if (!needle) return true
          return haystack.includes(needle)
        },
      },
    ],
    []
  )

  return (
    <>
      <DataTable
        data={permissions}
        columns={columns}
        initialState={{
          sorting: [{ id: "name", desc: false }],
          columnVisibility: {
            search: false,
          },
        }}
        toolbar={(table) => (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative max-w-sm flex-1">
                <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={
                    (table.getColumn("search")?.getFilterValue() as string) ??
                    ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn("search")
                      ?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm pl-9"
                />
              </div>
              <DataTableFacetedFilter
                title="Category"
                options={categories.map((category) => ({
                  label: category,
                  value: category,
                }))}
                column={table.getColumn("category")}
                multiple
              />
            </div>
            <div className="flex items-center gap-2">
              <DataTableViewOptions table={table} />
              <Button
                size="sm"
                className="h-8"
                onClick={() => {
                  setDialogOpen(false)
                  setEditingPermission(null)
                  setCreateDialogOpen(true)
                }}
              >
                <PlusIcon className="size-4" />
                Add Permission
              </Button>
            </div>
          </div>
        )}
        actionBar={(table) => (
          <DataTableActionBar table={table}>
            {(selectedPermissions, resetSelection) => {
              const onBulkDelete = async () => {
                const success = await bulkDeletePermissions(
                  selectedPermissions as PermissionRow[]
                )
                if (success) {
                  resetSelection()
                }
              }

              return (
                <Button
                  size="sm"
                  className="h-8"
                  variant="destructive"
                  onClick={() => {
                    void onBulkDelete()
                  }}
                >
                  <TrashIcon className="mr-2 size-4" />
                  Delete ({selectedPermissions.length})
                </Button>
              )
            }}
          </DataTableActionBar>
        )}
      />

      <PermissionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        permission={null}
        categories={categories}
        onSave={handleSavePermission}
      />
      <PermissionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        permission={editingPermission}
        categories={categories}
        onSave={handleSavePermission}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{permissionToDelete?.name}</strong>?
              {permissionToDelete?._count?.rolePermissions
                ? ` This permission is used by ${permissionToDelete._count.rolePermissions} role(s).`
                : " This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (permissionToDelete) {
                  void handleDelete(permissionToDelete)
                }
              }}
              disabled={
                isDeleting ||
                (permissionToDelete?._count?.rolePermissions ?? 0) > 0
              }
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
