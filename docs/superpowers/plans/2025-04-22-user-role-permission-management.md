# User, Role, & Permission Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build complete RBAC management interface with user, role, and permission CRUD operations, adapting features from naiera-admin to bandanaiera's architecture.

**Architecture:** Client-side forms with react-hook-form + zod validation, server-side services with Prisma, protected API routes using ADMIN\_\* permissions.

**Tech Stack:** Next.js 16, React 19, Prisma, shadcn/ui, lucide-react, @tanstack/react-table, zod, react-hook-form

---

## File Structure

### Files to Create

```
apps/support/
├── app/(backoffice)/manage/
│   ├── layout.tsx                          # New: manage section wrapper
│   ├── users/
│   │   └── layout.tsx                      # New: users page metadata
│   ├── roles/
│   │   ├── page.tsx                        # New: roles list page
│   │   └── layout.tsx                      # New: roles page metadata
│   └── permissions/
│       ├── page.tsx                        # New: permissions list page
│       └── layout.tsx                      # New: permissions page metadata
├── features/backoffice/components/admin/
│   ├── user-dialog.tsx                     # New: user create/edit dialog
│   ├── user-form.tsx                       # New: user form component
│   ├── role-dialog.tsx                     # New: role create/edit/clone dialog
│   ├── role-form.tsx                       # New: role form component
│   ├── role-delete-dialog.tsx              # New: role delete confirmation
│   ├── permission-dialog.tsx               # New: permission create/edit dialog
│   ├── roles-table.tsx                     # New: roles data table
│   ├── permissions-table.tsx               # New: permissions data table
│   └── permission-matrix.tsx               # New: permission selector component
├── lib/validations/
│   ├── user.ts                             # New: user validation schemas
│   ├── role.ts                             # New: role validation schemas
│   └── permission.ts                       # New: permission validation schemas
├── lib/services/
│   └── permission-service.ts               # New: permission CRUD service
└── app/api/
    ├── permissions/
    │   └── route.ts                        # New: permissions CRUD API
    └── roles/
        └── [id]/
            └── clone/
                └── route.ts                # New: role clone endpoint
```

### Files to Modify

```
apps/support/
├── features/backoffice/components/
│   ├── backoffice-sidebar.tsx              # Update: add manage section links
│   └── user-list.tsx                       # Enhance: add dialog integration
├── app/(backoffice)/layout.tsx             # Update: add manage to breadcrumb config
├── lib/services/
│   ├── user-service.ts                     # Enhance: add helper methods
│   └── role-service.ts                     # Enhance: add stats, clone
└── app/api/
    ├── users/
    │   └── [id]/route.ts                   # Enhance: add PUT method
    └── roles/
        └── route.ts                        # Enhance: add stats to GET
```

---

## Phase 1: Validation Schemas

### Task 1: Create User Validation Schemas

**Files:**

- Create: `apps/support/lib/validations/user.ts`

- [ ] **Step 1: Create user validation schemas**

```typescript
// apps/support/lib/validations/user.ts
import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().min(1, "Role is required"),
})

export const updateUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    roleId: z.string().min(1, "Role is required"),
  })
  .partial()

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/validations/user.ts
git commit -m "feat: add user validation schemas"
```

---

### Task 2: Create Role Validation Schemas

**Files:**

- Create: `apps/support/lib/validations/role.ts`

- [ ] **Step 1: Create role validation schemas**

```typescript
// apps/support/lib/validations/role.ts
import { z } from "zod"

// Permission type - will be a string like "ADMIN_USERS_MANAGE"
export type Permission = string

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must not exceed 50 characters")
    .regex(
      /^[A-Z_0-9]+$/,
      "Role name must be uppercase letters, numbers, and underscores only"
    ),
  description: z
    .string()
    .max(200, "Description must not exceed 200 characters")
    .optional(),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
})

export const updateRoleSchema = createRoleSchema.partial()

export const cloneRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must not exceed 50 characters")
    .regex(
      /^[A-Z_0-9]+$/,
      "Role name must be uppercase letters, numbers, and underscores only"
    ),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
export type CloneRoleInput = z.infer<typeof cloneRoleSchema>
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/validations/role.ts
git commit -m "feat: add role validation schemas"
```

---

### Task 3: Create Permission Validation Schemas

**Files:**

- Create: `apps/support/lib/validations/permission.ts`

- [ ] **Step 1: Create permission validation schemas**

```typescript
// apps/support/lib/validations/permission.ts
import { z } from "zod"

export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(3, "Permission name must be at least 3 characters")
    .max(100, "Permission name must not exceed 100 characters")
    .regex(
      /^[A-Z_0-9]+$/,
      "Permission name must be uppercase with underscores only (e.g., USER_READ)"
    )
    .refine(
      (val) => !val.startsWith("_") && !val.endsWith("_"),
      "Permission name cannot start or end with underscore"
    )
    .refine(
      (val) => !val.includes("__"),
      "Permission name cannot contain double underscores"
    )
    .transform((val) => val.toUpperCase()),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9\s_-]+$/,
      "Category can only contain letters, numbers, spaces, hyphens, and underscores"
    ),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
})

export const updatePermissionSchema = createPermissionSchema.partial()

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/validations/permission.ts
git commit -m "feat: add permission validation schemas"
```

---

## Phase 2: Permission Service

### Task 4: Create Permission Service

**Files:**

- Create: `apps/support/lib/services/permission-service.ts`

- [ ] **Step 1: Create permission service**

```typescript
// apps/support/lib/services/permission-service.ts
import { prisma } from "@/lib/prisma"

export interface PermissionStats {
  total: number
  byCategory: Record<string, number>
  unused: number
}

export const permissionService = {
  async listPermissions(options?: { includeUsage?: boolean }) {
    const include = options?.includeUsage
      ? {
          _count: {
            select: { rolePermissions: true },
          },
        }
      : {}

    return prisma.permission.findMany({
      include,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    })
  },

  async getPermissionById(id: string) {
    return prisma.permission.findUnique({
      where: { id },
    })
  },

  async createPermission(data: {
    name: string
    category: string
    description?: string
  }) {
    // Check if permission with this name already exists
    const existing = await prisma.permission.findUnique({
      where: { name: data.name },
    })

    if (existing) {
      throw new Error(`Permission with name "${data.name}" already exists`)
    }

    return prisma.permission.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description || null,
      },
    })
  },

  async updatePermission(
    id: string,
    data: { name?: string; category?: string; description?: string }
  ) {
    const existing = await prisma.permission.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new Error(`Permission with ID "${id}" not found`)
    }

    // If updating name, check for conflicts
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.permission.findUnique({
        where: { name: data.name },
      })

      if (nameConflict) {
        throw new Error(`Permission with name "${data.name}" already exists`)
      }
    }

    return prisma.permission.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        description:
          data.description !== undefined
            ? data.description
            : existing.description,
      },
    })
  },

  async deletePermission(id: string) {
    const existing = await prisma.permission.findUnique({
      where: { id },
      include: {
        _count: {
          select: { rolePermissions: true },
        },
      },
    })

    if (!existing) {
      throw new Error(`Permission with ID "${id}" not found`)
    }

    const usageCount = existing._count.rolePermissions
    if (usageCount > 0) {
      throw new Error(
        `Cannot delete permission "${existing.name}" - it is assigned to ${usageCount} role(s). Remove it from roles first.`
      )
    }

    return prisma.permission.delete({
      where: { id },
    })
  },

  async getPermissionStats(): Promise<PermissionStats> {
    const [total, unused, byCategory] = await Promise.all([
      prisma.permission.count(),
      prisma.permission.count({
        where: {
          rolePermissions: {
            none: {},
          },
        },
      }),
      prisma.permission.groupBy({
        by: ["category"],
        _count: true,
      }),
    ])

    const categoryMap: Record<string, number> = {}
    for (const cat of byCategory) {
      categoryMap[cat.category] = cat._count
    }

    return {
      total,
      unused,
      byCategory: categoryMap,
    }
  },

  async getCategories(): Promise<string[]> {
    const permissions = await prisma.permission.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    })

    return permissions.map((p) => p.category)
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/services/permission-service.ts
git commit -m "feat: add permission service with CRUD operations"
```

---

## Phase 3: Role Service Enhancements

### Task 5: Enhance Role Service

**Files:**

- Modify: `apps/support/lib/services/role-service.ts`

- [ ] **Step 1: Add stats and clone methods to role service**

Add the following to the existing `roleService` object in `apps/support/lib/services/role-service.ts`:

```typescript
// Add after existing methods...

async getRoleStats() {
  const [total, rolesWithUsers] = await Promise.all([
    prisma.role.count(),
    prisma.role.findMany({
      where: {
        users: {
          some: {},
        },
      },
      select: { id: true },
    }),
  ])

  return {
    total,
    withUsers: rolesWithUsers.length,
    withoutUsers: total - rolesWithUsers.length,
  }
},

async cloneRole(sourceRoleId: string, newName: string) {
  // Check if source role exists
  const sourceRole = await prisma.role.findUnique({
    where: { id: sourceRoleId },
    include: {
      permissions: {
        select: {
          permissionId: true,
        },
      },
    },
  })

  if (!sourceRole) {
    throw new Error("Source role not found")
  }

  // Check if new name already exists
  const nameConflict = await prisma.role.findUnique({
    where: { name: newName },
  })

  if (nameConflict) {
    throw new Error("Role with this name already exists")
  }

  // Create cloned role with same permissions
  return prisma.role.create({
    data: {
      name: newName,
      permissions: {
        create: sourceRole.permissions.map((rp) => ({
          permissionId: rp.permissionId,
        })),
      },
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  })
},

async getRoleWithUserCount(id: string) {
  return prisma.role.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true },
      },
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  })
},
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/lib/services/role-service.ts
git commit -m "feat: add stats and clone methods to role service"
```

---

## Phase 4: User Forms and Dialogs

### Task 6: Create User Form Component

**Files:**

- Create: `apps/support/features/backoffice/components/admin/user-form.tsx`

- [ ] **Step 1: Install required dependencies**

```bash
cd apps/support && pnpm add react-hook-form @hookform/resolvers
```

- [ ] **Step 2: Create user form component**

```typescript
// apps/support/features/backoffice/components/admin/user-form.tsx
"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/user"
import { createUserSchema, updateUserSchema } from "@/lib/validations/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"

interface UserFormProps {
  mode: "create" | "edit"
  initialData?: {
    name?: string
    email?: string
    roleId?: string
  }
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  roles: Array<{ id: string; name: string }>
}

export function UserForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  roles,
}: UserFormProps) {
  const schema = mode === "create" ? createUserSchema : updateUserSchema

  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      email: "",
      password: "",
      roleId: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          {...form.register("name")}
          disabled={isLoading}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...form.register("email")}
          disabled={isLoading}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...form.register("password")}
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="roleId">Role</Label>
        <Select
          onValueChange={(value) => form.setValue("roleId", value)}
          value={form.watch("roleId")}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.roleId && (
          <p className="text-sm text-destructive">{form.formState.errors.roleId.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : mode === "create" ? "Create User" : "Update User"}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/support/features/backoffice/components/admin/user-form.tsx
git commit -m "feat: add user form component with validation"
```

---

### Task 7: Create User Dialog Component

**Files:**

- Create: `apps/support/features/backoffice/components/admin/user-dialog.tsx`

- [ ] **Step 1: Create user dialog component**

```typescript
// apps/support/features/backoffice/components/admin/user-dialog.tsx
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
import { UserForm } from "./user-form"

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  userId?: string
  onSuccess?: () => void
}

export function UserDialog({ open, onOpenChange, mode, userId, onSuccess }: UserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([])
  const [initialData, setInitialData] = useState<{
    name?: string
    email?: string
    roleId?: string
  }>()

  useEffect(() => {
    if (open) {
      fetchRoles()
      if (mode === "edit" && userId) {
        fetchUser()
      } else {
        setInitialData(undefined)
      }
    }
  }, [open, mode, userId])

  async function fetchRoles() {
    try {
      const res = await fetch("/api/roles")
      if (!res.ok) throw new Error("Failed to fetch roles")
      const data = await res.json()
      setRoles(data.roles || [])
    } catch (error) {
      console.error("Failed to fetch roles:", error)
      toast.error("Failed to load roles")
    }
  }

  async function fetchUser() {
    try {
      const res = await fetch(`/api/users/${userId}`)
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || errorData.message || "Failed to fetch user")
      }
      const data = await res.json()
      setInitialData({
        name: data.user.name || "",
        email: data.user.email,
        roleId: data.user.roleId,
      })
    } catch (error) {
      console.error("Failed to fetch user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to load user data")
    }
  }

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

      toast.success(mode === "create" ? "User created successfully" : "User updated successfully")
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save user")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new user to the system with their role and permissions."
              : "Update user information and role assignment."}
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
          <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/features/backoffice/components/admin/user-dialog.tsx
git commit -m "feat: add user dialog component"
```

---

### Task 8: Integrate User Dialog into User List

**Files:**

- Modify: `apps/support/features/backoffice/components/user-list.tsx`

- [ ] **Step 1: Add dialog integration to user list**

Add the import at the top:

```typescript
import { UserDialog } from "./admin/user-dialog"
```

Add state variables after existing state:

```typescript
const [createDialogOpen, setCreateDialogOpen] = useState(false)
const [editDialog, setEditDialog] = useState<{ open: boolean; userId: string }>(
  {
    open: false,
    userId: "",
  }
)
```

Replace the existing "Add User" button onClick handlers:

```typescript
// In toolbar Add User button:
onClick={() => setCreateDialogOpen(true)}

// In empty state Create User button:
onClick={() => setCreateDialogOpen(true)}

// In edit dropdown menu item:
onClick={() => setEditDialog({ open: true, userId: user.id })}
```

Add the dialog components before the closing `</>` tag:

```typescript
<UserDialog
  open={createDialogOpen}
  onOpenChange={setCreateDialogOpen}
  mode="create"
  onSuccess={fetchUsers}
/>
<UserDialog
  open={editDialog.open}
  onOpenChange={(open) => setEditDialog({ open, userId: open ? editDialog.userId : "" })}
  mode="edit"
  userId={editDialog.userId}
  onSuccess={fetchUsers}
/>
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/features/backoffice/components/user-list.tsx
git commit -m "feat: integrate user dialog into user list"
```

---

## Phase 5: Role Components

### Task 9: Create Permission Matrix Component

**Files:**

- Create: `apps/support/features/backoffice/components/admin/permission-matrix.tsx`

- [ ] **Step 1: Create permission matrix component**

```typescript
// apps/support/features/backoffice/components/admin/permission-matrix.tsx
"use client"

import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Label } from "@workspace/ui/components/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
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
            description: categoryDescriptions.get(catName) || `${catName} permissions`,
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
    const allSelected = category.permissions.every((p) => selectedPermissions.includes(p))

    if (allSelected) {
      onChange(selectedPermissions.filter((p) => !category.permissions.includes(p)))
    } else {
      const newPermissions = new Set(selectedPermissions)
      category.permissions.forEach((p) => newPermissions.add(p))
      onChange(Array.from(newPermissions))
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading permissions...</div>
  }

  if (categories.length === 0) {
    return <div className="text-sm text-muted-foreground">No permissions found</div>
  }

  return (
    <Tabs defaultValue={categories[0]?.name ?? ""}>
      <TabsList className="flex flex-col justify-start bg-transparent p-0 gap-1 w-full sm:w-56">
        {categories.map((cat) => (
          <TabsTrigger
            key={cat.name}
            value={cat.name}
            className="justify-start px-3 py-2 bg-transparent text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground"
          >
            {cat.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => (
        <TabsContent key={category.name} value={category.name} className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{category.name} Permissions</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toggleCategory(category)}
              disabled={disabled}
            >
              {category.permissions.every((p) => selectedPermissions.includes(p))
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
                  className="flex-1 cursor-pointer font-normal text-sm"
                >
                  <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/features/backoffice/components/admin/permission-matrix.tsx
git commit -m "feat: add permission matrix component"
```

---

### Task 10: Create Role Form Component

**Files:**

- Create: `apps/support/features/backoffice/components/admin/role-form.tsx`

- [ ] **Step 1: Create role form component**

```typescript
// apps/support/features/backoffice/components/admin/role-form.tsx
"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import type { Permission } from "@/lib/validations/role"
import type {
  CloneRoleInput,
  CreateRoleInput,
  UpdateRoleInput,
} from "@/lib/validations/role"
import { cloneRoleSchema, createRoleSchema, updateRoleSchema } from "@/lib/validations/role"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { PermissionMatrix } from "./permission-matrix"

interface RoleFormProps {
  mode: "create" | "edit" | "clone"
  initialData?: {
    name?: string
    description?: string
    permissions?: Permission[]
    sourceRoleId?: string
  }
  onSubmit: (data: CreateRoleInput | UpdateRoleInput | CloneRoleInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  roles?: { id: string; name: string }[]
}

export function RoleForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  roles = [],
}: RoleFormProps) {
  const schema =
    mode === "clone"
      ? cloneRoleSchema
      : mode === "create"
        ? createRoleSchema
        : updateRoleSchema

  const form = useForm<CreateRoleInput | UpdateRoleInput | CloneRoleInput>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      description: "",
      permissions: [],
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  const selectedPermissions = (form.watch("permissions") || []) as Permission[]

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {mode === "clone" && (
        <div className="space-y-2">
          <Label htmlFor="sourceRoleId">Source Role</Label>
          <p className="text-sm text-muted-foreground">
            Cloning from: {roles.find((r) => r.id === initialData?.sourceRoleId)?.name || "Unknown"}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Role Name</Label>
        <Input
          id="name"
          placeholder="CONTENT_MANAGER"
          {...form.register("name")}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          Use uppercase letters, numbers, and underscores only (e.g., CONTENT_MANAGER)
        </p>
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      {mode !== "clone" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this role..."
              {...form.register("description")}
              disabled={isLoading}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <PermissionMatrix
              selectedPermissions={selectedPermissions}
              onChange={(permissions) => form.setValue("permissions", permissions as string[])}
              disabled={isLoading}
            />
            {form.formState.errors.permissions && (
              <p className="text-sm text-destructive">{form.formState.errors.permissions.message}</p>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || (mode !== "clone" && selectedPermissions.length === 0)}
        >
          {isLoading
            ? "Saving..."
            : mode === "create"
              ? "Create Role"
              : mode === "clone"
                ? "Clone Role"
                : "Update Role"}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/features/backoffice/components/admin/role-form.tsx
git commit -m "feat: add role form component"
```

---

### Task 11: Create Role Dialog Component

**Files:**

- Create: `apps/support/features/backoffice/components/admin/role-dialog.tsx`

- [ ] **Step 1: Create role dialog component**

```typescript
// apps/support/features/backoffice/components/admin/role-dialog.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import type { Permission } from "@/lib/validations/role"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { RoleForm } from "./role-form"

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit" | "clone"
  roleId?: string
  onSuccess?: () => void
}

export function RoleDialog({ open, onOpenChange, mode, roleId, onSuccess }: RoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([])
  const [initialData, setInitialData] = useState<{
    name?: string
    description?: string
    permissions?: Permission[]
    sourceRoleId?: string
  }>()

  useEffect(() => {
    if (open && mode === "clone") {
      fetchRoles()
    }
    if (open && mode !== "create" && roleId) {
      fetchRole()
    } else if (mode === "create") {
      setInitialData(undefined)
    }
  }, [open, mode, roleId])

  async function fetchRoles() {
    try {
      const res = await fetch("/api/roles")
      if (!res.ok) throw new Error("Failed to fetch roles")
      const data = await res.json()
      setRoles(data.roles || [])
    } catch (error) {
      console.error("Failed to fetch roles:", error)
      toast.error("Failed to load roles")
    }
  }

  async function fetchRole() {
    try {
      const res = await fetch(`/api/roles/${roleId}`)
      if (!res.ok) throw new Error("Failed to fetch role")
      const data = await res.json()

      // Transform permissions to array of strings
      const permissions = data.role.permissions?.map((p: any) => {
        if (typeof p === "string") return p
        if (p.name) return p.name
        if (p.permission?.name) return p.permission.name
        return p
      }) || []

      setInitialData({
        name: data.role.name,
        description: data.role.description || "",
        permissions,
        sourceRoleId: roleId,
      })
    } catch (error) {
      console.error("Failed to fetch role:", error)
      toast.error("Failed to load role data")
    }
  }

  async function handleSubmit(
    data:
      | { name: string; description?: string; permissions?: string[] }
      | { name?: string; description?: string; permissions?: string[] }
      | { name: string; sourceRoleId?: string }
  ) {
    setIsLoading(true)
    try {
      let url, method

      if (mode === "clone") {
        url = `/api/roles/${roleId}/clone`
        method = "POST"
      } else if (mode === "create") {
        url = "/api/roles"
        method = "POST"
      } else {
        url = `/api/roles/${roleId}`
        method = "PATCH"
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.message || "Failed to save role")
      }

      const successMessage =
        mode === "clone"
          ? "Role cloned successfully"
          : mode === "create"
            ? "Role created successfully"
            : "Role updated successfully"

      toast.success(successMessage)
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save role:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save role")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Role" : mode === "clone" ? "Clone Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define a new role with specific permissions."
              : mode === "clone"
                ? "Create a copy of this role with a new name."
                : "Update role permissions and settings."}
          </DialogDescription>
        </DialogHeader>
        {initialData !== undefined || mode === "create" ? (
          <RoleForm
            mode={mode}
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
            roles={roles}
          />
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/features/backoffice/components/admin/role-dialog.tsx
git commit -m "feat: add role dialog component"
```

---

### Task 12: Create Role Delete Dialog Component

**Files:**

- Create: `apps/support/features/backoffice/components/admin/role-delete-dialog.tsx`

- [ ] **Step 1: Create role delete dialog component**

```typescript
// apps/support/features/backoffice/components/admin/role-delete-dialog.tsx
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
      toast.error("Cannot delete role with assigned users. Please reassign users first.")
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
      toast.error(error instanceof Error ? error.message : "Failed to delete role")
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
              <span className="block mt-2 text-destructive">
                This role is assigned to {userCount} user{userCount > 1 ? "s" : ""}. You cannot delete
                a role with assigned users.
              </span>
            )}
            {userCount === 0 && (
              <span className="block mt-2">This action cannot be undone.</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || userCount > 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/features/backoffice/components/admin/role-delete-dialog.tsx
git commit -m "feat: add role delete dialog component"
```

---

### Task 13: Create Roles Table Component

**Files:**

- Create: `apps/support/features/backoffice/components/admin/roles-table.tsx`

- [ ] **Step 1: Install tanstack table**

```bash
cd apps/support && pnpm add @tanstack/react-table
```

- [ ] **Step 2: Create roles table component**

```typescript
// apps/support/features/backoffice/components/admin/roles-table.tsx
"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  ArrowUpDown,
  Copy,
  Edit,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react"
import type {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table"
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

interface Role {
  id: string
  name: string
  permissions: string[]
  _count: { users: number }
}

interface RolesTableProps {
  data: Role[]
  onRefresh: () => void
  onEdit: (roleId: string) => void
  onClone: (roleId: string) => void
  onDelete: (roleId: string, roleName: string, userCount: number) => void
  onCreate: () => void
}

export function RolesTable({
  data,
  onRefresh,
  onEdit,
  onClone,
  onDelete,
  onCreate,
}: RolesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<Role>[] = [
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <Badge variant="outline">{row.getValue("name")}</Badge>,
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
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const userCount = row.original._count?.users || 0
        return (
          <div className="text-center">
            <Badge variant={userCount > 0 ? "default" : "secondary"} className="font-mono">
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
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(role.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onClone(role.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Clone
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(role.id, role.name, role._count?.users || 0)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
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
                        : header.column.columnDef.header
                          ? header.column.columnDef.header as any
                          : header.column.columnDef.header}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/support/features/backoffice/components/admin/roles-table.tsx
git commit -m "feat: add roles table component with tanstack"
```

---

## Phase 6: Permission Components

### Task 14: Create Permission Dialog Component

**Files:**

- Create: `apps/support/features/backoffice/components/admin/permission-dialog.tsx`

- [ ] **Step 1: Create permission dialog component**

```typescript
// apps/support/features/backoffice/components/admin/permission-dialog.tsx
"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface PermissionRecord {
  id: string
  name: string
  category: string
  description: string | null
}

interface PermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permission?: PermissionRecord | null
  onSave: (data: { name: string; category: string; description?: string }) => Promise<void>
}

const DEFAULT_CATEGORIES = ["Admin", "User", "Role", "Permission", "Content", "Settings", "System"]

export function PermissionDialog({
  open,
  onOpenChange,
  permission,
  onSave,
}: PermissionDialogProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [saving, setSaving] = useState(false)
  const [existingCategories, setExistingCategories] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open])

  useEffect(() => {
    if (permission) {
      setName(permission.name)
      setCategory(permission.category)
      setDescription(permission.description || "")
      setIsCustomCategory(!DEFAULT_CATEGORIES.includes(permission.category))
      setCustomCategory(
        !DEFAULT_CATEGORIES.includes(permission.category) ? permission.category : ""
      )
    } else {
      setName("")
      setCategory("")
      setDescription("")
      setIsCustomCategory(false)
      setCustomCategory("")
    }
  }, [permission])

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/permissions")
      if (!response.ok) return

      const data = await response.json()
      const categories = Array.from(
        new Set(data.permissions.map((p: PermissionRecord) => p.category))
      ) as string[]
      setExistingCategories(categories)
    } catch (error) {
      console.error("Failed to load categories:", error)
    }
  }

  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories])).sort()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Permission name is required")
      return
    }

    if (!category.trim() && !customCategory.trim()) {
      toast.error("Category is required")
      return
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category.trim()

    if (!finalCategory) {
      toast.error("Category is required")
      return
    }

    const formattedName = name
      .toUpperCase()
      .replace(/\s+/g, "_")
      .replace(/[^A-Z0-9_]/g, "")

    if (formattedName !== name) {
      setName(formattedName)
      toast.info("Permission name auto-formatted to uppercase with underscores")
    }

    setSaving(true)

    try {
      await onSave({
        name: formattedName,
        category: finalCategory,
        description: description.trim() || undefined,
      })

      setName("")
      setCategory("")
      setDescription("")
      setIsCustomCategory(false)
      setCustomCategory("")
    } catch (error) {
      console.error("Failed to save permission:", error)
    } finally {
      setSaving(false)
    }
  }

  const isEditing = !!permission

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Permission" : "Create New Permission"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the permission details below."
              : "Create a new permission for role-based access control."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Permission Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., USER_READ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Will be auto-formatted to UPPERCASE_WITH_UNDERSCORES
              </p>
            </div>

            <div className="grid gap-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>

              {!isCustomCategory ? (
                <Select value={category} onValueChange={setCategory} disabled={saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">+ Custom Category</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    disabled={saving}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCustomCategory(false)
                      setCustomCategory("")
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {!isCustomCategory && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground"
                  onClick={() => setIsCustomCategory(true)}
                  disabled={saving}
                >
                  + Create custom category
                </Button>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe what this permission allows"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Permission" : "Create Permission"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/features/backoffice/components/admin/permission-dialog.tsx
git commit -m "feat: add permission dialog component"
```

---

### Task 15: Create Permissions Table Component

**Files:**

- Create: `apps/support/features/backoffice/components/admin/permissions-table.tsx`

- [ ] **Step 1: Create permissions table component**

```typescript
// apps/support/features/backoffice/components/admin/permissions-table.tsx
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  ArrowUpDown,
  Edit,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import type {
  ColumnDef,
  SortingState,
} from "@tanstack/react-table"
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Loader2, useState } from "react"
import { toast } from "sonner"
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

export function PermissionsTable({ data, categories, onRefresh }: PermissionsTableProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<PermissionRecord | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permissionToDelete, setPermissionToDelete] = useState<PermissionRecord | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredData = data.filter((permission) => {
    const matchesCategory = categoryFilter === "all" || permission.category === categoryFilter
    const matchesSearch =
      !searchQuery ||
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleSavePermission = async (
    data: { name: string; category: string; description?: string }
  ) => {
    const url = editingPermission ? `/api/permissions/${editingPermission.id}` : "/api/permissions"
    const method = editingPermission ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || error.message || "Failed to save permission")
    }

    toast.success(editingPermission ? "Permission updated" : "Permission created")
    onRefresh()
  }

  const handleDelete = async () => {
    if (!permissionToDelete) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/permissions/${permissionToDelete.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.message || "Failed to delete permission")
      }

      toast.success("Permission deleted")
      onRefresh()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete permission:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete permission")
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<PermissionRecord>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
          {row.getValue("name")}
        </code>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <Badge variant="outline">{row.getValue("category")}</Badge>,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.getValue("description") || "-"}</span>
      ),
    },
    {
      accessorKey: "usage",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Usage
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const usageCount = row.original._count?.rolePermissions || 0
        return (
          <div className="text-center">
            <Badge variant={usageCount > 0 ? "default" : "secondary"} className="font-mono">
              {usageCount}
            </Badge>
          </div>
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
              <Button variant="ghost" size="icon" aria-label="Actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingPermission(permission)
                  setDialogOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  setPermissionToDelete(permission)
                  setDeleteDialogOpen(true)
                }}
                disabled={usageCount > 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Permission
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : header.column.columnDef.header
                          ? header.column.columnDef.header as any
                          : null}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.column.columnDef.cell
                          ? (cell.column.columnDef.cell as any)({ ...cell.getContext() })
                          : null}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No permissions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <PermissionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        permission={null}
        onSave={handleSavePermission}
      />
      <PermissionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        permission={editingPermission}
        onSave={handleSavePermission}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{permissionToDelete?.name}</strong>?
              {permissionToDelete?._count?.rolePermissions
                ? ` This permission is used by ${permissionToDelete._count.rolePermissions} role(s).`
                : " This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || (permissionToDelete?._count?.rolePermissions ?? 0) > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/features/backoffice/components/admin/permissions-table.tsx
git commit -m "feat: add permissions table component"
```

---

## Phase 7: Pages and Routes

### Task 16: Create Permissions API Routes

**Files:**

- Create: `apps/support/app/api/permissions/route.ts`
- Create: `apps/support/app/api/permissions/[id]/route.ts`

- [ ] **Step 1: Create permissions list and create route**

```typescript
// apps/support/app/api/permissions/route.ts
import { auth } from "@/lib/auth/config"
import { permissionService } from "@/lib/services/permission-service"
import { requirePermission } from "@/lib/rbac/permissions"
import { createPermissionSchema } from "@/lib/validations/permission"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ADMIN_PERMISSIONS_MANAGE")

    const { searchParams } = new URL(req.url)
    const includeUsage = searchParams.get("includeUsage") === "true"
    const includeStats = searchParams.get("stats") === "true"

    const permissions = await permissionService.listPermissions({
      includeUsage,
    })

    let stats = null
    if (includeStats) {
      stats = await permissionService.getPermissionStats()
    }

    return NextResponse.json({
      permissions,
      stats,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch permissions",
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ADMIN_PERMISSIONS_MANAGE")

    const body = await req.json()
    const validatedData = createPermissionSchema.parse(body)

    const permission = await permissionService.createPermission(validatedData)

    return NextResponse.json(
      {
        permission,
        message: "Permission created successfully",
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Conflict",
          message: "Permission with this name already exists",
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create permission",
      },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Create permission detail route**

```typescript
// apps/support/app/api/permissions/[id]/route.ts
import { auth } from "@/lib/auth/config"
import { permissionService } from "@/lib/services/permission-service"
import { requirePermission } from "@/lib/rbac/permissions"
import { updatePermissionSchema } from "@/lib/validations/permission"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ADMIN_PERMISSIONS_MANAGE")

    const { id } = await params
    const body = await req.json()
    const validatedData = updatePermissionSchema.parse(body)

    const permission = await permissionService.updatePermission(
      id,
      validatedData
    )

    return NextResponse.json({
      permission,
      message: "Permission updated successfully",
    })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update permission",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ADMIN_PERMISSIONS_MANAGE")

    const { id } = await params
    await permissionService.deletePermission(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete permission",
      },
      { status: error.message?.includes("assigned to") ? 400 : 500 }
    )
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/support/app/api/permissions/
git commit -m "feat: add permissions API routes"
```

---

### Task 17: Create Role Clone API Route

**Files:**

- Create: `apps/support/app/api/roles/[id]/clone/route.ts`

- [ ] **Step 1: Create role clone route**

```typescript
// apps/support/app/api/roles/[id]/clone/route.ts
import { auth } from "@/lib/auth/config"
import { requirePermission } from "@/lib/rbac/permissions"
import { roleService } from "@/lib/services/role-service"
import { cloneRoleSchema } from "@/lib/validations/role"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ADMIN_ROLES_MANAGE")

    const { id } = await params
    const body = await req.json()

    const { name } = cloneRoleSchema.parse(body)

    const clonedRole = await roleService.cloneRole(id, name)

    return NextResponse.json(
      {
        role: clonedRole,
        message: "Role cloned successfully",
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    if (error.message === "Role with this name already exists") {
      return NextResponse.json(
        {
          error: "Conflict",
          message: error.message,
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to clone role",
      },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/app/api/roles/[id]/clone/route.ts
git commit -m "feat: add role clone API endpoint"
```

---

### Task 18: Enhance Roles API Route with Stats

**Files:**

- Modify: `apps/support/app/api/roles/route.ts`

- [ ] **Step 1: Add stats support to roles GET route**

Replace the existing GET handler with:

```typescript
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await requirePermission(session.user.id, "ADMIN_ROLES_MANAGE")

    const { searchParams } = new URL(req.url)
    const includeStats = searchParams.get("stats") === "true"

    const roles = await roleService.listRoles()

    let stats = null
    if (includeStats) {
      stats = await roleService.getRoleStats()
    }

    return NextResponse.json({
      roles,
      stats,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch roles",
      },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/app/api/roles/route.ts
git commit -m "feat: add stats support to roles API"
```

---

### Task 19: Create Users Page Layout

**Files:**

- Create: `apps/support/app/(backoffice)/users/layout.tsx`

- [ ] **Step 1: Create users layout**

```typescript
// apps/support/app/(backoffice)/users/layout.tsx
export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/app/\(backoffice\)/users/layout.tsx
git commit -m "feat: add users page layout"
```

---

### Task 20: Create Roles Page

**Files:**

- Create: `apps/support/app/(backoffice)/roles/page.tsx`
- Create: `apps/support/app/(backoffice)/roles/layout.tsx`

- [ ] **Step 1: Create roles page**

```typescript
// apps/support/app/(backoffice)/roles/page.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { RoleDeleteDialog } from "@/features/backoffice/components/admin/role-delete-dialog"
import { RoleDialog } from "@/features/backoffice/components/admin/role-dialog"
import { RolesTable } from "@/features/backoffice/components/admin/roles-table"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Role {
  id: string
  name: string
  permissions: string[]
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
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Available in system</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">In Use</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.withUsers}</p>
          <p className="text-xs text-muted-foreground">Assigned to users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Unused</CardTitle>
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

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialog, setEditDialog] = useState<{ open: boolean; roleId: string }>({
    open: false,
    roleId: "",
  })
  const [cloneDialog, setCloneDialog] = useState<{ open: boolean; roleId: string }>({
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

  const handleCreateOpen = () => {
    setCreateDialogOpen(true)
  }

  const handleEdit = (roleId: string) => {
    setEditDialog({ open: true, roleId })
  }

  const handleClone = (roleId: string) => {
    setCloneDialog({ open: true, roleId })
  }

  const handleDelete = (roleId: string, roleName: string, userCount: number) => {
    setDeleteDialog({ open: true, roleId, roleName, userCount })
  }

  const handleRefresh = () => {
    fetchRoles()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Manage roles and their permissions</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-muted-foreground">Create and manage roles with permissions</p>
      </div>

      <RolesStats stats={stats} />

      <RolesTable
        data={roles}
        onRefresh={handleRefresh}
        onEdit={handleEdit}
        onClone={handleClone}
        onDelete={handleDelete}
        onCreate={handleCreateOpen}
      />

      <RoleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={handleRefresh}
      />
      <RoleDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, roleId: open ? editDialog.roleId : "" })}
        mode="edit"
        roleId={editDialog.roleId}
        onSuccess={handleRefresh}
      />
      <RoleDialog
        open={cloneDialog.open}
        onOpenChange={(open) => setCloneDialog({ open, roleId: open ? cloneDialog.roleId : "" })}
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
```

- [ ] **Step 2: Create roles layout**

```typescript
// apps/support/app/(backoffice)/roles/layout.tsx
export default function RolesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/support/app/\(backoffice\)/roles/
git commit -m "feat: add roles management page"
```

---

### Task 21: Create Permissions Page

**Files:**

- Create: `apps/support/app/(backoffice)/permissions/page.tsx`
- Create: `apps/support/app/(backoffice)/permissions/layout.tsx`

- [ ] **Step 1: Create permissions page**

```typescript
// apps/support/app/(backoffice)/permissions/page.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { PermissionsTable } from "@/features/backoffice/components/admin/permissions-table"
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
          <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{categories.length}</p>
          <p className="text-xs text-muted-foreground">Permission categories</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Unused</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.unused}</p>
          <p className="text-xs text-muted-foreground">Not assigned to roles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">In Use</CardTitle>
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
      const response = await fetch("/api/permissions?includeUsage=true&stats=true")
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
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PermissionsStats stats={stats} />

      <div>
        <h1 className="text-3xl font-bold">Permission Management</h1>
        <p className="text-muted-foreground">
          Create and manage permissions for role-based access control
        </p>
      </div>

      <PermissionsTable data={permissions} categories={categories} onRefresh={loadPermissions} />
    </div>
  )
}
```

- [ ] **Step 2: Create permissions layout**

```typescript
// apps/support/app/(backoffice)/permissions/layout.tsx
export default function PermissionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/support/app/\(backoffice\)/permissions/
git commit -m "feat: add permissions management page"
```

---

### Task 22: Update Breadcrumb Configuration

**Files:**

- Modify: `apps/support/app/(backoffice)/layout.tsx`

- [ ] **Step 1: Add manage section routes to breadcrumb config**

Add the following entries to the `breadcrumbConfig` object:

```typescript
const breadcrumbConfig: Record<
  string,
  { label: string; parent?: string; isSection?: boolean }
> = {
  // ... existing entries ...
  "/roles": { label: "Roles", isSection: true },
  "/roles/[id]": { label: "Role Details", parent: "/roles" },
  "/permissions": { label: "Permissions", isSection: true },
  "/permissions/[id]": { label: "Permission Details", parent: "/permissions" },
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/support/app/\(backoffice\)/layout.tsx
git commit -m "feat: add manage routes to breadcrumb config"
```

---

### Task 23: Update Sidebar Navigation

**Files:**

- Modify: `apps/support/features/backoffice/components/backoffice-sidebar.tsx`

- [ ] **Step 1: Update sidebar nav items**

Replace the existing `navMain` data with separate entries for Users, Roles, and Permissions:

```typescript
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <BarChartIcon />,
    },
    {
      title: "Users",
      url: "/users",
      icon: <UsersIcon />,
    },
    {
      title: "Roles",
      url: "/roles",
      icon: <ShieldCheckIcon />,
    },
    {
      title: "Permissions",
      url: "/permissions",
      icon: <KeyIcon />, // Add KeyIcon to imports
    },
    {
      title: "Configuration",
      icon: <SettingsIcon />,
      items: [
        {
          title: "Settings",
          url: "/settings",
        },
      ],
    },
  ],
}
```

Also add `KeyIcon` to the imports from `lucide-react`.

- [ ] **Step 2: Commit**

```bash
git add apps/support/features/backoffice/components/backoffice-sidebar.tsx
git commit -m "feat: update sidebar with separate roles/permissions links"
```

---

## Phase 8: Final Polish

### Task 24: Create Manage Section Layout

**Files:**

- Create: `apps/support/app/(backoffice)/manage/layout.tsx`

- [ ] **Step 1: Create manage section layout wrapper**

```typescript
// apps/support/app/(backoffice)/manage/layout.tsx
export default function ManageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
```

- [ ] **Step 2: Move existing pages to manage structure**

Move the following pages:

- `apps/support/app/(backoffice)/users/` → `apps/support/app/(backoffice)/manage/users/`
- `apps/support/app/(backoffice)/roles/` → `apps/support/app/(backoffice)/manage/roles/`
- `apps/support/app/(backoffice)/permissions/` → `apps/support/app/(backoffice)/manage/permissions/`

- [ ] **Step 3: Update breadcrumb config for new paths**

- [ ] \*\*Step 4: Update sidebar links to point to `/manage/users`, `/manage/roles`, `/manage/permissions`

- [ ] **Step 5: Commit**

```bash
git add apps/support/app/\(backoffice\)/manage/
git commit -m "feat: create manage section with nested routes"
```

---

## Testing Checklist

After completing all tasks, verify:

- [ ] Users can be created with name, email, password, and role
- [ ] Users can be edited (name, email, role)
- [ ] Users can be deleted
- [ ] Roles can be created with name and permissions
- [ ] Roles can be edited
- [ ] Roles can be cloned
- [ ] Roles cannot be deleted if they have users
- [ ] Permissions can be created with name, category, description
- [ ] Permissions can be edited
- [ ] Permissions cannot be deleted if assigned to roles
- [ ] Stats dashboards show correct counts
- [ ] Tables sort correctly
- [ ] Search and filters work
- [ ] Permission checks work (unauthorized users cannot access)
- [ ] All toasts display correctly
- [ ] Loading states show properly

---

Plan written and committed to: `docs/superpowers/plans/2025-04-22-user-role-permission-management.md`
