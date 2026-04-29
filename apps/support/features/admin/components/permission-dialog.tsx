// apps/support/features/admin/components/permission-dialog.tsx
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
  categories: string[]
  onSave: (data: {
    name: string
    category: string
    description?: string
  }) => Promise<void>
}

const DEFAULT_CATEGORIES = [
  "ADMIN",
  "USER",
  "ROLE",
  "PERMISSION",
  "CONTENT",
  "SETTINGS",
  "SYSTEM",
]

const normalizeCategory = (value: string) => value.trim().toUpperCase()

export function PermissionDialog({
  open,
  onOpenChange,
  permission,
  categories,
  onSave,
}: PermissionDialogProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (permission) {
      setName(permission.name)
      setCategory(normalizeCategory(permission.category))
      setDescription(permission.description || "")
      const normalizedCategory = normalizeCategory(permission.category)
      setIsCustomCategory(!DEFAULT_CATEGORIES.includes(normalizedCategory))
      setCustomCategory(
        !DEFAULT_CATEGORIES.includes(normalizedCategory)
          ? normalizedCategory
          : ""
      )
    } else {
      setName("")
      setCategory("")
      setDescription("")
      setIsCustomCategory(false)
      setCustomCategory("")
    }
  }, [permission])

  const allCategories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...categories.map((category) => normalizeCategory(category)),
    ])
  ).sort()

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

    const finalCategory = isCustomCategory
      ? normalizeCategory(customCategory)
      : normalizeCategory(category)

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
          <DialogTitle>
            {isEditing ? "Edit Permission" : "Create New Permission"}
          </DialogTitle>
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
                <Select
                  value={category}
                  onValueChange={(value) => {
                    if (value === "__custom__") {
                      setIsCustomCategory(true)
                      setCategory("")
                      setCustomCategory("")
                      return
                    }

                    setCategory(normalizeCategory(value))
                  }}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">
                      + Custom Category
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) =>
                      setCustomCategory(normalizeCategory(e.target.value))
                    }
                    disabled={saving}
                    className="uppercase"
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
              <p className="text-xs text-muted-foreground">
                {description.length}/500 characters
              </p>
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
