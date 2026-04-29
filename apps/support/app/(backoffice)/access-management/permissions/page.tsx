// apps/support/app/(backoffice)/access-management/permissions/page.tsx
"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { PermissionsTable } from "@/features/admin/components/permissions-table"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface PermissionRecord {
  id: string
  name: string
  category: string
  description: string | null
  _count?: {
    rolePermissions: number
  }
}

interface PermissionStats {
  total: number
  byCategory: Record<string, number>
  unused: number
}

function PermissionsStats({ stats }: { stats: PermissionStats | null }) {
  if (!stats) return null

  const categories = Object.keys(stats.byCategory)

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Permissions
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
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{categories.length}</p>
          <p className="text-xs text-muted-foreground">Permission categories</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unused
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.unused}</p>
          <p className="text-xs text-muted-foreground">Not assigned to roles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            In Use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total - stats.unused}</p>
          <p className="text-xs text-muted-foreground">Assigned to roles</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionRecord[]>([])
  const [stats, setStats] = useState<PermissionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        "/api/permissions?includeUsage=true&stats=true"
      )
      if (!response.ok) throw new Error("Failed to load permissions")

      const data = await response.json()
      setPermissions(data.permissions || [])
      setStats(data.stats || null)
      setCategories(data.stats ? Object.keys(data.stats.byCategory) : [])
    } catch (error) {
      console.error("Failed to load permissions:", error)
      toast.error("Failed to load permissions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPermissions()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Permission Management</h1>
          <p className="text-muted-foreground">
            Create and manage permissions for role-based access control
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
        <h1 className="text-3xl font-bold">Permission Management</h1>
        <p className="text-muted-foreground">
          Create and manage permissions for role-based access control
        </p>
      </div>

      <PermissionsStats stats={stats} />

      <Card>
        <CardContent className="p-6">
          <PermissionsTable
            data={permissions}
            categories={categories}
            onRefresh={loadPermissions}
          />
        </CardContent>
      </Card>
    </div>
  )
}
