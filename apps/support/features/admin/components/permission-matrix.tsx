// apps/support/features/admin/components/permission-matrix.tsx
"use client"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import type { Permission } from "@/lib/validations/role"
import { useEffect, useState } from "react"

interface PermissionCategory {
  name: string
  permissions: Permission[]
  description: string
}

interface PermissionMatrixProps {
  selectedPermissions: Permission[]
  onChange: (permissions: Permission[]) => void
  disabled?: boolean
}

export function PermissionMatrix({
  selectedPermissions,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  const [categories, setCategories] = useState<PermissionCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPermissions() {
      try {
        const response = await fetch("/api/permissions")
        if (!response.ok) throw new Error("Failed to load permissions")

        const data = await response.json()
        const permissions = data.permissions as Array<{
          name: string
          category: string
          description: string | null
        }>

        const categoryMap = new Map<string, Permission[]>()
        const categoryDescriptions = new Map<string, string>()

        for (const perm of permissions) {
          if (!categoryMap.has(perm.category)) {
            categoryMap.set(perm.category, [])
          }
          categoryMap.get(perm.category)!.push(perm.name as Permission)

          if (!categoryDescriptions.has(perm.category) && perm.description) {
            categoryDescriptions.set(perm.category, perm.description)
          }
        }

        const cats: PermissionCategory[] = Array.from(categoryMap.entries())
          .map(([catName, perms]) => ({
            name: catName,
            permissions: perms,
            description:
              categoryDescriptions.get(catName) || `${catName} permissions`,
          }))
          .sort((a, b) => a.name.localeCompare(b.name))

        setCategories(cats)
      } catch (error) {
        console.error("Failed to load permissions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPermissions()
  }, [])

  const togglePermission = (permission: Permission) => {
    if (selectedPermissions.includes(permission)) {
      onChange(selectedPermissions.filter((p) => p !== permission))
    } else {
      onChange([...selectedPermissions, permission])
    }
  }

  const toggleCategory = (category: PermissionCategory) => {
    const allSelected = category.permissions.every((p) =>
      selectedPermissions.includes(p)
    )

    if (allSelected) {
      onChange(
        selectedPermissions.filter((p) => !category.permissions.includes(p))
      )
    } else {
      const newPermissions = new Set(selectedPermissions)
      category.permissions.forEach((p) => newPermissions.add(p))
      onChange(Array.from(newPermissions))
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading permissions...
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">No permissions found</div>
    )
  }

  return (
    <Tabs defaultValue={categories[0]?.name ?? ""}>
      <TabsList className="flex w-full flex-col justify-start gap-1 bg-transparent p-0 sm:w-56">
        {categories.map((cat) => (
          <TabsTrigger
            key={cat.name}
            value={cat.name}
            className="justify-start bg-transparent px-3 py-2 text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground"
          >
            {cat.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => (
        <TabsContent
          key={category.name}
          value={category.name}
          className="mt-0 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{category.name} Permissions</h3>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toggleCategory(category)}
              disabled={disabled}
            >
              {category.permissions.every((p) =>
                selectedPermissions.includes(p)
              )
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          <div className="space-y-2">
            {category.permissions.map((permission) => (
              <div key={permission} className="flex items-center space-x-2">
                <Checkbox
                  id={permission}
                  checked={selectedPermissions.includes(permission)}
                  onCheckedChange={() => togglePermission(permission)}
                  disabled={disabled}
                />
                <Label
                  htmlFor={permission}
                  className="flex-1 cursor-pointer text-sm font-normal"
                >
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                    {permission}
                  </code>
                </Label>
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
