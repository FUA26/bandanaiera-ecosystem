// apps/support/features/admin/components/role-form.tsx
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
import {
  cloneRoleSchema,
  createRoleSchema,
  updateRoleSchema,
} from "@/lib/validations/role"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm, useWatch, type Resolver } from "react-hook-form"
import { PermissionMatrix } from "./permission-matrix"

type RoleFormValues = {
  name: string
  description?: string
  permissions: string[]
  sourceRoleId?: string
}

interface RoleFormProps {
  mode: "create" | "edit" | "clone"
  initialData?: {
    name?: string
    description?: string
    permissions?: Permission[]
    sourceRoleId?: string
  }
  onSubmit: (
    data: CreateRoleInput | UpdateRoleInput | CloneRoleInput
  ) => Promise<void>
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

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<RoleFormValues>,
    defaultValues: initialData || {
      name: "",
      description: "",
      permissions: [],
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        description: initialData.description,
        permissions: initialData.permissions ?? [],
        sourceRoleId: initialData.sourceRoleId,
      })
    }
  }, [initialData, form])

  const selectedPermissions =
    useWatch({
      control: form.control,
      name: "permissions",
    }) || []

  return (
    <form
      onSubmit={form.handleSubmit((values) =>
        onSubmit(values as CreateRoleInput | UpdateRoleInput | CloneRoleInput)
      )}
      className="space-y-6"
    >
      {mode === "clone" && (
        <div className="space-y-2">
          <Label htmlFor="sourceRoleId">Source Role</Label>
          <p className="text-sm text-muted-foreground">
            Cloning from:{" "}
            {roles.find((r) => r.id === initialData?.sourceRoleId)?.name ||
              "Unknown"}
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
          Use uppercase letters, numbers, and underscores only (e.g.,
          CONTENT_MANAGER)
        </p>
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
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
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <PermissionMatrix
              selectedPermissions={selectedPermissions}
              onChange={(permissions) =>
                form.setValue("permissions", permissions, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              disabled={isLoading}
            />
            {form.formState.errors.permissions && (
              <p className="text-sm text-destructive">
                {form.formState.errors.permissions.message}
              </p>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isLoading || (mode !== "clone" && selectedPermissions.length === 0)
          }
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
