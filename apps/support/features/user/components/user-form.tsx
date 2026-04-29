// apps/support/features/user/components/user-form.tsx
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
import { useForm, useWatch, type Resolver } from "react-hook-form"
import {
  UserIcon,
  MailIcon,
  LockIcon,
  ShieldIcon,
  InfoIcon,
} from "lucide-react"
import { formatRoleLabel } from "@/lib/rbac/role-labels"

type UserFormValues = {
  name: string
  email: string
  password?: string
  roleId: string
}

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

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<UserFormValues>,
    defaultValues: initialData || {
      name: "",
      email: "",
      password: "",
      roleId: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        email: initialData.email ?? "",
        roleId: initialData.roleId ?? "",
        password: "",
      })
    }
  }, [initialData, form])

  const selectedRoleId = useWatch({
    control: form.control,
    name: "roleId",
  })

  return (
    <form
      onSubmit={form.handleSubmit((values) =>
        onSubmit(values as CreateUserInput | UpdateUserInput)
      )}
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <UserIcon className="size-4 text-muted-foreground" />
          Full Name
        </Label>
        <Input
          id="name"
          placeholder="e.g. Alex Rivera"
          {...form.register("name")}
          disabled={isLoading}
          className="transition-colors focus:border-primary/50"
        />
        {form.formState.errors.name && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <MailIcon className="size-4 text-muted-foreground" />
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="e.g. alex@example.com"
          {...form.register("email")}
          disabled={isLoading}
          className="transition-colors focus:border-primary/50"
        />
        {form.formState.errors.email && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <LockIcon className="size-4 text-muted-foreground" />
            Password
            <span className="font-normal text-muted-foreground">
              (required)
            </span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...form.register("password")}
            disabled={isLoading}
            className="transition-colors focus:border-primary/50"
          />
          <p className="text-xs text-muted-foreground">
            Minimum 8 characters. Use a mix of letters, numbers, and symbols for
            better security.
          </p>
          {form.formState.errors.password && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="roleId" className="flex items-center gap-2">
          <ShieldIcon className="size-4 text-muted-foreground" />
          Role
        </Label>
        <Select
          onValueChange={(value) => form.setValue("roleId", value)}
          value={selectedRoleId}
          disabled={isLoading}
        >
          <SelectTrigger className="transition-colors focus:border-primary/50">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            side="bottom"
            sideOffset={4}
            avoidCollisions={false}
          >
            {roles.length === 0 ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No roles available. Create one first.
              </div>
            ) : (
              roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex items-center gap-2">
                    <span>{formatRoleLabel(role.name)}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <InfoIcon className="size-3" />
          The role determines what permissions and access this user will have.
        </p>
        {form.formState.errors.roleId && (
          <p className="flex items-center gap-1 text-sm text-destructive">
            {form.formState.errors.roleId.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-border/50 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="min-w-[100px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[100px] gap-2"
        >
          {isLoading
            ? "Saving..."
            : mode === "create"
              ? "Create User"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
