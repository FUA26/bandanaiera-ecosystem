"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { RoleDeleteDialog } from "@/features/admin/components/role-delete-dialog"
import { RoleDialog } from "@/features/admin/components/role-dialog"
import { RolesDataTable } from "@/features/admin/components/roles-data-table"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Role {
  id: string
  name: string
  description: string | null
  permissions: string[]
  createdAt: string
  updatedAt: string
  _count: { users: number }
}

interface RoleStats {
  total: number
  withUsers: number
  withoutUsers: number
}

function RolesStats({ stats }: { stats: RoleStats | null }) {
  if (!stats) return null

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Available in system</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            In Use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.withUsers}</p>
          <p className="text-xs text-muted-foreground">Assigned to users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unused
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.withoutUsers}</p>
          <p className="text-xs text-muted-foreground">Not assigned</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [stats, setStats] = useState<RoleStats | null>(null)
  const [loading, setLoading] = useState(true)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    roleId: string
  }>({
    open: false,
    roleId: "",
  })
  const [cloneDialog, setCloneDialog] = useState<{
    open: boolean
    roleId: string
  }>({
    open: false,
    roleId: "",
  })
  const [deleteDialog, setDeleteDialog] = useState<{
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

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/roles?stats=true")
      if (!res.ok) throw new Error("Failed to fetch roles")

      const data = await res.json()
      setRoles(data.roles || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error("Failed to fetch roles:", error)
      toast.error("Failed to load roles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleRefresh = () => {
    fetchRoles()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">
            Create and manage roles with permissions
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-80 animate-pulse rounded-lg bg-muted/40" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-muted-foreground">
          Create and manage roles with permissions
        </p>
      </div>

      <RolesStats stats={stats} />

      <Card>
        <CardContent className="p-6">
          <RolesDataTable roles={roles} onRefresh={handleRefresh} />
        </CardContent>
      </Card>

      <RoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={handleRefresh}
      />
      <RoleDialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog({ open, roleId: open ? editDialog.roleId : "" })
        }
        mode="edit"
        roleId={editDialog.roleId}
        onSuccess={handleRefresh}
      />
      <RoleDialog
        open={cloneDialog.open}
        onOpenChange={(open) =>
          setCloneDialog({ open, roleId: open ? cloneDialog.roleId : "" })
        }
        mode="clone"
        roleId={cloneDialog.roleId}
        onSuccess={handleRefresh}
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
        onSuccess={handleRefresh}
      />
    </div>
  )
}
