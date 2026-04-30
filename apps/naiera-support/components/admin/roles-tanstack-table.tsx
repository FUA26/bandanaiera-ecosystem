"use client"

/**
 * Roles TanStack Data Table Component
 *
 * Advanced data table for managing roles with sorting, filtering, and pagination
 */

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  AddCircleIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Copy01Icon,
  Delete01Icon,
  Edit01Icon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { DataTableActionBar } from "@/components/admin/data-table"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import { toast } from "sonner"

interface Role {
  id: string
  name: string
  permissions: string[]
  _count: { users: number }
}

interface RolesTanStackTableProps {
  data: Role[]
  onRefresh: () => void
  onEdit: (roleId: string) => void
  onClone: (roleId: string) => void
  onDelete: (roleId: string, roleName: string, userCount: number) => void
  onCreate: () => void
}

export function RolesTanStackTable({
  data,
  onRefresh,
  onEdit,
  onClone,
  onDelete,
  onCreate,
}: RolesTanStackTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const columns: ColumnDef<Role>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="translate-y-[2px]"
          aria-label="Select all roles"
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Role Name
            <HugeiconsIcon
              icon={
                column.getIsSorted() === "asc" ? ArrowUp01Icon : ArrowDown01Icon
              }
              className="ml-2 h-4 w-4"
            />
          </Button>
        )
      },
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("name")}</Badge>
      ),
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => {
        const permissions = row.original.permissions || []
        return (
          <div className="flex flex-wrap gap-1">
            {permissions.slice(0, 3).map((permission) => (
              <Badge key={permission} variant="secondary" className="text-xs">
                {permission}
              </Badge>
            ))}
            {permissions.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{permissions.length - 3} more
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "users",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Users
            <HugeiconsIcon
              icon={
                column.getIsSorted() === "asc" ? ArrowUp01Icon : ArrowDown01Icon
              }
              className="ml-2 h-4 w-4"
            />
          </Button>
        )
      },
      cell: ({ row }) => {
        const userCount = row.original._count?.users || 0
        return (
          <div className="text-center">
            <Badge
              variant={userCount > 0 ? "default" : "secondary"}
              className="font-mono"
            >
              {userCount}
            </Badge>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const role = row.original
        const userCount = role._count?.users || 0

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(role.id)}>
                <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onClone(role.id)}>
                <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
                Clone
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onDelete(role.id, role.name, role._count?.users || 0)
                }
                className="text-destructive"
                disabled={userCount > 0}
              >
                <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <>
      {/* Header with search and create button */}
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter roles..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button onClick={onCreate}>
          <HugeiconsIcon icon={AddCircleIcon} className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <DataTableActionBar table={table}>
        {(selectedRows, resetSelection) => {
          const selectedRoles = selectedRows as Role[]

          return (
            <Button
              size="sm"
              variant="destructive"
              disabled={isBulkDeleting}
              onClick={async () => {
                const deletableRoles = selectedRoles.filter(
                  (role) => (role._count?.users || 0) === 0
                )
                const blockedRoles = selectedRoles.filter(
                  (role) => (role._count?.users || 0) > 0
                )

                if (selectedRoles.length === 0) return

                if (blockedRoles.length > 0) {
                  toast.error(
                    `${blockedRoles.length} selected role${blockedRoles.length > 1 ? "s are" : " is"} in use and cannot be deleted`
                  )
                }

                if (deletableRoles.length === 0) {
                  return
                }

                const confirmed = window.confirm(
                  `Delete ${deletableRoles.length} selected role${deletableRoles.length > 1 ? "s" : ""}? This cannot be undone.`
                )
                if (!confirmed) return

                setIsBulkDeleting(true)
                try {
                  const results = await Promise.allSettled(
                    deletableRoles.map(async (role) => {
                      const res = await fetch(`/api/roles/${role.id}`, {
                        method: "DELETE",
                      })
                      if (!res.ok) {
                        const error = await res.json().catch(() => null)
                        throw new Error(
                          error?.message || `Failed to delete ${role.name}`
                        )
                      }
                    })
                  )

                  const failed = results.filter(
                    (result): result is PromiseRejectedResult =>
                      result.status === "rejected"
                  )

                  if (failed.length > 0) {
                    toast.error(
                      `Deleted ${deletableRoles.length - failed.length} role${deletableRoles.length - failed.length === 1 ? "" : "s"}, ${failed.length} failed`
                    )
                  } else {
                    toast.success(
                      `Deleted ${deletableRoles.length} role${deletableRoles.length === 1 ? "" : "s"}`
                    )
                  }

                  resetSelection()
                  onRefresh()
                } catch (error) {
                  console.error("Failed to bulk delete roles:", error)
                  toast.error("Failed to delete selected roles")
                } finally {
                  setIsBulkDeleting(false)
                }
              }}
            >
              {isBulkDeleting
                ? "Deleting..."
                : `Delete ${selectedRoles.length} selected`}
            </Button>
          )
        }}
      </DataTableActionBar>
    </>
  )
}
