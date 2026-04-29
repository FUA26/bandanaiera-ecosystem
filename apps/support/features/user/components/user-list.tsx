"use client"

import * as React from "react"

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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "sonner"
import {
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  UserPlusIcon,
} from "lucide-react"
import { UserDialog } from "./user-dialog"
import { UserDetailDialog } from "./user-detail-dialog"
import { formatRoleLabel } from "@/lib/rbac/role-labels"

// Types
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

interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export function UserList() {
  const [users, setUsers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [totalCount, setTotalCount] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(0)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean
    user: User | null
  }>({ open: false, user: null })
  const [bulkDeleteDialog, setBulkDeleteDialog] = React.useState(false)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialog, setEditDialog] = React.useState<{
    open: boolean
    userId: string
  }>({
    open: false,
    userId: "",
  })
  const [detailDialog, setDetailDialog] = React.useState<{
    open: boolean
    userId: string
  }>({
    open: false,
    userId: "",
  })

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
      })

      const response = await fetch(`/api/users?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data: UsersResponse = await response.json()
      setUsers(data.users)
      setTotalCount(data.pagination.totalCount)
      setTotalPages(data.pagination.totalPages)
    } catch {
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, search])

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [fetchUsers])

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

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/users/${id}`, { method: "DELETE" })
        )
      )

      toast.success(
        `${selectedIds.size} user${selectedIds.size > 1 ? "s" : ""} deleted successfully`
      )
      setSelectedIds(new Set())
      setBulkDeleteDialog(false)
      fetchUsers()
    } catch {
      toast.error("Failed to delete users")
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const allSelected = users.length > 0 && selectedIds.size === users.length
  const someSelected = selectedIds.size > 0

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)))
    }
  }

  const toggleOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            {totalCount} {totalCount === 1 ? "user" : "users"}
          </p>
          {someSelected && (
            <p className="text-xs text-muted-foreground">
              {selectedIds.size} selected
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-72 pl-9 transition-colors focus-within:border-primary/50"
            />
          </div>
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2"
          >
            <PlusIcon className="size-4" />
            Add User
          </Button>
          {someSelected && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setBulkDeleteDialog(true)}
              className="gap-2"
            >
              <TrashIcon className="size-4" />
              Delete ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border/50 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b-border/50 hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all users"
                />
              </TableHead>
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-9 w-20 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-80">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <UserPlusIcon className="size-12 text-muted-foreground/40" />
                    <div className="space-y-1">
                      <p className="text-lg font-semibold">
                        {search ? "No users found" : "No users yet"}
                      </p>
                      <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                        {search
                          ? "Try adjusting your search terms."
                          : "Create your first user account to get started."}
                      </p>
                    </div>
                    {!search && (
                      <Button
                        size="sm"
                        onClick={() => setCreateDialogOpen(true)}
                        className="gap-2"
                      >
                        <PlusIcon className="size-4" />
                        Create User
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="group border-border/50 transition-colors hover:bg-muted/30"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(user.id)}
                      onCheckedChange={() => toggleOne(user.id)}
                      aria-label={`Select ${user.name || user.email}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 ring-2 ring-background/50">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {user.name || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="cursor-help border-primary/20 bg-primary/5 text-xs font-medium text-foreground transition-colors hover:bg-primary/10"
                      title={`Role: ${formatRoleLabel(user.role?.name)}. Roles determine permissions.`}
                    >
                      {formatRoleLabel(user.role?.name)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="h-8 w-8"
                          >
                            <MoreVerticalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Actions for {user.name || user.email}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setDetailDialog({ open: true, userId: user.id })
                            }
                          >
                            <EyeIcon className="mr-2 size-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setEditDialog({ open: true, userId: user.id })
                            }
                          >
                            <PencilIcon className="mr-2 size-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() =>
                              setDeleteDialog({ open: true, user })
                            }
                          >
                            <TrashIcon className="mr-2 size-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(page - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(page * pageSize, totalCount)}
            </span>{" "}
            of <span className="font-medium text-foreground">{totalCount}</span>{" "}
            users
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="min-w-[80px]"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNum =
                  totalPages > 5
                    ? page <= 3
                      ? i + 1
                      : page >= totalPages - 2
                        ? totalPages - 4 + i
                        : page - 2 + i
                    : i + 1
                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={page === pageNum ? "default" : "outline"}
                    onClick={() => setPage(pageNum)}
                    className={
                      page === pageNum ? "min-w-[36px]" : "min-w-[36px]"
                    }
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="min-w-[80px]"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Single Delete Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user account</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                {deleteDialog.user?.name || deleteDialog.user?.email}
              </strong>
              ? Their data will be permanently removed and this action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.size} user{selectedIds.size > 1 ? "s" : ""}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{selectedIds.size}</strong>{" "}
              user
              {selectedIds.size > 1 ? "s" : ""}? All their data will be
              permanently removed and this action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              Delete {selectedIds.size} user{selectedIds.size > 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Create/Edit Dialogs */}
      <UserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={fetchUsers}
      />
      <UserDialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog({ open, userId: open ? editDialog.userId : "" })
        }
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
    </>
  )
}
