/**
 * Apps & Channels Management Page
 *
 * Main client component for managing support apps and their channels.
 * Refactored to use custom hooks for better code organization and maintainability.
 */

"use client"

import { useState, useMemo, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Plus,
  Search,
  Sparkles,
  MessageSquare,
  Settings,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Check,
  Code,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Badge } from "@workspace/ui/components/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Card, CardContent } from "@workspace/ui"
import { toast } from "sonner"
import { usePermissions } from "@/lib/rbac-client/provider"
import { cn } from "@/lib/utils"
import type {
  App,
  Channel,
  ChannelType,
  DeleteDialogState,
} from "@/lib/types/apps"
import {
  CHANNEL_TYPE_OPTIONS,
  getChannelConfig,
} from "@/lib/constants/channel-config"
import { getIntegrationCode } from "@/lib/utils/integration-helpers"
import { useAppDialog } from "@/hooks/use-app-dialog"
import { useChannelDialog } from "@/hooks/use-channel-dialog"
import { useAppMutations } from "@/hooks/use-app-mutations"
import { useChannelMutations } from "@/hooks/use-channel-mutations"

/** Query key for apps list */
const APPS_QUERY_KEY = ["apps"] as const

export function AppsClient() {
  const userPermissions = usePermissions()
  const canManage =
    userPermissions?.permissions.includes("TICKET_APP_MANAGE") ?? false

  // Custom hooks for state management
  const appDialog = useAppDialog()
  const channelDialog = useChannelDialog()

  // Delete dialog state (separate since it handles both apps and channels)
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    type: "app",
    item: null,
    app: null,
  })

  // Copy code state
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Search state
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all")
  const [page, setPage] = useState(1)
  const pageSize = 9

  // Mutations
  const appMutations = useAppMutations(appDialog.close)
  const channelMutations = useChannelMutations(
    channelDialog.closeDialog,
    channelDialog.closeSheet
  )

  // Query apps
  const { data, isLoading } = useQuery({
    queryKey: APPS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/apps")
      if (!res.ok) throw new Error("Failed to fetch apps")
      return res.json()
    },
  })

  // Memoized filtered apps
  const filteredApps = useMemo(() => {
    const apps = data?.items ?? []
    if (!search) return apps

    const searchLower = search.toLowerCase()
    return apps.filter(
      (app: App) =>
        app.name.toLowerCase().includes(searchLower) ||
        app.slug.toLowerCase().includes(searchLower)
    )
  }, [data, search])

  const visibleApps = useMemo(() => {
    const apps = filteredApps.filter((app) => {
      if (statusFilter === "active") return app.isActive
      if (statusFilter === "inactive") return !app.isActive
      return true
    })

    return [...apps].sort(
      (a, b) =>
        Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name)
    )
  }, [filteredApps, statusFilter])

  const totalVisibleApps = visibleApps.length
  const totalPages = Math.max(1, Math.ceil(totalVisibleApps / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return visibleApps.slice(start, start + pageSize)
  }, [currentPage, visibleApps])

  // Stats calculations
  const stats = useMemo(() => {
    const apps = data?.items ?? []
    const activeApps = apps.filter((app: App) => app.isActive).length
    return {
      totalApps: apps.length,
      activeApps,
      inactiveApps: apps.length - activeApps,
      totalChannels: apps.reduce(
        (sum: number, app: App) => sum + app.channels.length,
        0
      ),
      totalTickets: apps.reduce(
        (sum: number, app: App) => sum + (app._count?.tickets ?? 0),
        0
      ),
    }
  }, [data])

  // Handlers
  const openDeleteDialog = useCallback(
    (type: "app" | "channel", item: App | Channel, app: App) => {
      setDeleteDialog({ open: true, type, item, app })
    },
    []
  )

  const handleDelete = useCallback(() => {
    if (!deleteDialog.item) return

    if (deleteDialog.type === "app") {
      appMutations.deleteApp((deleteDialog.item as App).id)
    } else {
      channelMutations.deleteChannel((deleteDialog.item as Channel).id)
    }
    setDeleteDialog((prev) => ({ ...prev, open: false }))
  }, [deleteDialog.item, deleteDialog.type, appMutations, channelMutations])

  const copyToClipboard = useCallback((text: string, key: string) => {
    // Fallback for browsers where clipboard API is not available
    if (!navigator.clipboard) {
      // Use the deprecated but more widely supported method
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        setCopiedCode(key)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopiedCode(null), 2000)
      } catch {
        toast.error("Failed to copy to clipboard")
      }
      document.body.removeChild(textArea)
      return
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedCode(key)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopiedCode(null), 2000)
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard")
      })
  }, [])

  const handleSaveApp = useCallback(() => {
    const error = appDialog.validate()
    if (error) {
      toast.error(error)
      return
    }

    if (appDialog.dialog.mode === "create") {
      appMutations.createApp(appDialog.getCreatePayload())
    } else if (appDialog.dialog.app) {
      const payload = appDialog.getUpdatePayload()
      if (payload && Object.keys(payload).length > 0) {
        appMutations.updateApp({ id: appDialog.dialog.app.id, data: payload })
      } else {
        toast.info("No changes to save")
        appDialog.close()
      }
    }
  }, [appDialog, appMutations])

  const handleSaveChannel = useCallback(() => {
    const error = channelDialog.validate()
    if (error) {
      toast.error(error)
      return
    }

    const isEdit = channelDialog.isEditMode()

    if (!isEdit) {
      const payload = channelDialog.getCreatePayload("dummy")
      if (payload) {
        channelMutations.createChannel(payload)
      }
    } else {
      const payload = channelDialog.getUpdatePayload()
      const targetChannel =
        channelDialog.dialog.channel || channelDialog.sheet.channel
      if (payload && targetChannel) {
        channelMutations.updateChannel({ id: targetChannel.id, data: payload })
      } else if (!payload) {
        toast.info("No changes to save")
        channelDialog.closeDialog()
        channelDialog.closeSheet()
      }
    }
  }, [channelDialog, channelMutations])

  const hasActiveFilter = statusFilter !== "all"
  const hasSearch = !!search
  const emptyStateMode = hasSearch || hasActiveFilter ? "filtered" : "empty"

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Apps
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Browse apps, create new ones, and manage channels from one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {canManage && (
            <Button onClick={appDialog.openCreate} className="rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              Create App
            </Button>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Apps"
          value={stats.totalApps}
          description="In the catalog"
        />
        <StatCard
          label="Active Apps"
          value={stats.activeApps}
          description="Ready to route"
        />
        <StatCard
          label="Channels"
          value={stats.totalChannels}
          description="Connected entry points"
        />
      </div>

      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search apps or slugs"
                className="h-11 rounded-2xl border-border/70 bg-background/80 pl-10 shadow-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterPill
                active={!hasActiveFilter}
                label="All"
                onClick={() => {
                  setStatusFilter("all")
                  setPage(1)
                }}
              />
              <FilterPill
                active={statusFilter === "active"}
                label="Active"
                onClick={() => {
                  setStatusFilter("active")
                  setPage(1)
                }}
              />
              <FilterPill
                active={statusFilter === "inactive"}
                label="Inactive"
                onClick={() => {
                  setStatusFilter("inactive")
                  setPage(1)
                }}
              />
            </div>
          </div>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <AppCardSkeleton key={index} />
              ))}
            </div>
          ) : totalVisibleApps === 0 ? (
            <EmptyState
              mode={emptyStateMode}
              hasManage={canManage}
              onCreateApp={appDialog.openCreate}
              onClearFilters={() => {
                setSearch("")
                setStatusFilter("all")
                setPage(1)
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginatedApps.map((app: App) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    canManage={canManage}
                    onEdit={() => appDialog.openEdit(app)}
                    onAddChannel={() => channelDialog.openCreate(app)}
                    onManageChannel={(channel) =>
                      channelDialog.openSheet(app, channel)
                    }
                    onDeleteChannel={(channel) =>
                      openDeleteDialog("channel", channel, app)
                    }
                    onDelete={() => openDeleteDialog("app", app, app)}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, totalVisibleApps)} of{" "}
                  {totalVisibleApps} apps
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* App Dialog */}
      <AppDialog
        dialog={appDialog.dialog}
        formData={appDialog.formData}
        onOpenChange={appDialog.setOpen}
        onSave={handleSaveApp}
        onNameChange={(name) =>
          appDialog.dispatchForm({ type: "SET_NAME", name })
        }
        onSlugChange={(slug) =>
          appDialog.dispatchForm({
            type: "SET_SLUG",
            slug: appDialog.formatSlug(slug),
          })
        }
        onDescriptionChange={(description) =>
          appDialog.dispatchForm({ type: "SET_DESCRIPTION", description })
        }
        onActiveChange={(isActive) =>
          appDialog.dispatchForm({ type: "SET_ACTIVE", isActive })
        }
        isSaving={appMutations.isCreating || appMutations.isUpdating}
      />

      {/* Channel Dialog */}
      <ChannelDialog
        dialog={channelDialog.dialog}
        formData={channelDialog.formData}
        onOpenChange={channelDialog.setDialogOpen}
        onSave={handleSaveChannel}
        onNameChange={(name) =>
          channelDialog.dispatchForm({ type: "SET_NAME", name })
        }
        onTypeChange={(type) =>
          channelDialog.dispatchForm({
            type: "SET_TYPE",
            channelType: type as ChannelType,
          })
        }
        onActiveChange={(isActive) =>
          channelDialog.dispatchForm({ type: "SET_ACTIVE", isActive })
        }
        isSaving={channelMutations.isCreating || channelMutations.isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        dialog={deleteDialog}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        onConfirm={handleDelete}
        isDeleting={appMutations.isDeleting || channelMutations.isDeleting}
      />

      {/* Manage Channel Sheet */}
      <ManageChannelSheet
        sheet={channelDialog.sheet}
        formData={channelDialog.formData}
        onOpenChange={channelDialog.setSheetOpen}
        onSave={handleSaveChannel}
        onDelete={() => {
          channelDialog.setSheetOpen(false)
          if (channelDialog.sheet.channel && channelDialog.sheet.app) {
            openDeleteDialog(
              "channel",
              channelDialog.sheet.channel,
              channelDialog.sheet.app
            )
          }
        }}
        onNameChange={(name) =>
          channelDialog.dispatchForm({ type: "SET_NAME", name })
        }
        onTypeChange={(type) =>
          channelDialog.dispatchForm({
            type: "SET_TYPE",
            channelType: type as ChannelType,
          })
        }
        onActiveChange={(isActive) =>
          channelDialog.dispatchForm({ type: "SET_ACTIVE", isActive })
        }
        onCopy={copyToClipboard}
        copiedCode={copiedCode}
        isSaving={channelMutations.isUpdating}
      />
    </div>
  )
}

// ============================================================================
// Sub Components
// ============================================================================

/** Empty State Component */
function EmptyState({
  mode,
  onCreateApp,
  hasManage,
  onClearFilters,
}: {
  mode: "filtered" | "empty"
  onCreateApp: () => void
  hasManage: boolean
  onClearFilters: () => void
}) {
  return (
    <div className="rounded-[28px] border border-border/70 bg-card/85 p-8 shadow-sm">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-background/80">
          <Sparkles className="size-7 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">
          {mode === "filtered" ? "No matching apps" : "Your catalog is empty"}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {mode === "filtered"
            ? "Try a different search, change the status filter, or clear sorting to widen the result set."
            : "Create your first app so routing channels have somewhere to live."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {mode === "filtered" && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          )}
          {hasManage && (
            <Button onClick={onCreateApp}>
              <Plus className="mr-2 h-4 w-4" />
              {mode === "filtered" ? "Create app" : "Create first app"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-border/70 bg-background/70 text-muted-foreground hover:bg-muted/70"
      )}
    >
      {label}
    </button>
  )
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string
  value: number
  description: string
}) {
  return (
    <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
      <CardContent className="space-y-1.5 p-4">
        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function AppCardSkeleton() {
  return (
    <div className="space-y-4 rounded-[24px] border border-border/70 bg-card/80 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 w-36 rounded-full bg-muted" />
          <div className="h-3.5 w-24 rounded-full bg-muted" />
        </div>
        <div className="h-8 w-8 rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-10 rounded-2xl bg-muted" />
        <div className="h-10 rounded-2xl bg-muted" />
        <div className="h-10 rounded-2xl bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded-full bg-muted" />
        <div className="h-3.5 w-5/6 rounded-full bg-muted" />
      </div>
      <div className="h-10 rounded-2xl bg-muted" />
    </div>
  )
}

/** App Dialog Component */
function AppDialog({
  dialog,
  formData,
  onOpenChange,
  onSave,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
  onActiveChange,
  isSaving,
}: {
  dialog: { open: boolean; mode: "create" | "edit" }
  formData: {
    name: string
    slug: string
    description: string
    isActive: boolean
  }
  onOpenChange: (open: boolean) => void
  onSave: () => void
  onNameChange: (name: string) => void
  onSlugChange: (slug: string) => void
  onDescriptionChange: (description: string) => void
  onActiveChange: (isActive: boolean) => void
  isSaving: boolean
}) {
  return (
    <Dialog open={dialog.open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {dialog.mode === "create" ? "Create New App" : "Edit App"}
          </DialogTitle>
          <DialogDescription>
            {dialog.mode === "create"
              ? "Create a new support app to organize tickets by service or product."
              : "Update the app details."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Name *</Label>
            <Input
              id="appName"
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Customer Support"
              className="rounded-lg border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appSlug">Slug</Label>
            <Input
              id="appSlug"
              value={formData.slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="e.g., customer-support"
              className="rounded-lg border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate from name
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appDescription">Description</Label>
            <Textarea
              id="appDescription"
              value={formData.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Brief description of this app..."
              rows={3}
              className="rounded-lg border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">
                Enable this app for ticket creation
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={onActiveChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            {isSaving
              ? "Saving..."
              : dialog.mode === "create"
                ? "Create"
                : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Channel Dialog Component */
function ChannelDialog({
  dialog,
  formData,
  onOpenChange,
  onSave,
  onNameChange,
  onTypeChange,
  onActiveChange,
  isSaving,
}: {
  dialog: { open: boolean; mode: "create" | "edit"; app: App | null }
  formData: { name: string; type: string; isActive: boolean }
  onOpenChange: (open: boolean) => void
  onSave: () => void
  onNameChange: (name: string) => void
  onTypeChange: (type: string) => void
  onActiveChange: (isActive: boolean) => void
  isSaving: boolean
}) {
  return (
    <Dialog open={dialog.open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {dialog.mode === "create" ? "Add Channel" : "Edit Channel"}
          </DialogTitle>
          <DialogDescription>
            {dialog.mode === "create"
              ? `Add a new channel to ${dialog.app?.name || "this app"}`
              : "Update the channel details."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="channelName">Name *</Label>
            <Input
              id="channelName"
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Website Form"
              className="rounded-lg border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channelType">Type *</Label>
            <Select value={formData.type} onValueChange={onTypeChange}>
              <SelectTrigger
                id="channelType"
                className="rounded-lg border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", option.color)} />
                        {option.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">
                Enable this channel for ticket creation
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={onActiveChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            {isSaving ? "Saving..." : dialog.mode === "create" ? "Add" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Delete Confirmation Dialog */
function DeleteDialog({
  dialog,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  dialog: DeleteDialogState
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting: boolean
}) {
  return (
    <Dialog open={dialog.open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Delete {dialog.type === "app" ? "App" : "Channel"}?
          </DialogTitle>
          <DialogDescription>
            {dialog.type === "app"
              ? "This will delete the app and all its channels. This action cannot be undone."
              : "This will delete the channel. This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** App Card Component */
function AppCard({
  app,
  canManage,
  onEdit,
  onAddChannel,
  onManageChannel,
  onDeleteChannel,
  onDelete,
}: {
  app: App
  canManage: boolean
  onEdit: () => void
  onAddChannel: () => void
  onManageChannel: (channel: Channel) => void
  onDeleteChannel: (channel: Channel) => void
  onDelete: () => void
}) {
  const displayChannels = app.channels.slice(0, 2)
  const extraChannels = Math.max(
    0,
    app.channels.length - displayChannels.length
  )

  return (
    <article className="group rounded-[24px] border border-border/70 bg-card/90 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold tracking-tight">
              {app.name}
            </h3>
            <Badge
              variant={app.isActive ? "default" : "secondary"}
              className="rounded-full"
            >
              {app.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {app.description || "No description yet."}
          </p>
        </div>

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex size-8 items-center justify-center rounded-full border border-border/70 bg-background/80 transition-colors hover:bg-muted"
                aria-label="App options"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <EditIcon />
                Manage App
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <DeleteIcon />
                Delete App
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
          {app.slug}
        </span>
        <span className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
          {app.channels.length} channels
        </span>
        <span className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
          {app._count.tickets} tickets
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <div className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
          Channels
        </div>
        <div className="space-y-1.5">
          {displayChannels.map((channel) => (
            <ChannelBadge
              key={channel.id}
              channel={channel}
              onManage={onManageChannel}
              onDelete={() => onDeleteChannel(channel)}
              canManage={canManage}
            />
          ))}
          {app.channels.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/70 px-3 py-4 text-sm text-muted-foreground">
              No channels yet.
            </div>
          )}
          {extraChannels > 0 && (
            <div className="px-1 pt-1 text-xs text-muted-foreground">
              +{extraChannels} more
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {canManage && (
          <Button onClick={onAddChannel} className="h-10 flex-1 rounded-2xl">
            <MessageSquare className="mr-2 h-4 w-4" />
            Add channel
          </Button>
        )}
      </div>
    </article>
  )
}

/** Channel Badge Component */
function ChannelBadge({
  channel,
  onManage,
  onDelete,
  canManage,
}: {
  channel: Channel
  onManage: (channel: Channel) => void
  onDelete: () => void
  canManage: boolean
}) {
  const config = getChannelConfig(channel.type)
  if (!config) return null
  const Icon = config.icon

  return (
    <div className="group/channel flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 p-3 transition-colors hover:bg-background">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-xl",
            config.bgLight,
            config.bgDark
          )}
        >
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 truncate text-sm font-medium">
            {channel.name}
            {!channel.isActive && (
              <span className="text-xs text-muted-foreground">(inactive)</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{config.label}</div>
        </div>
      </div>
      {canManage && (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/channel:opacity-100">
          <button
            onClick={() => onManage(channel)}
            className="flex size-8 items-center justify-center rounded-full border border-border/70 bg-background hover:bg-muted"
            title="Manage channel"
          >
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="flex size-8 items-center justify-center rounded-full border border-border/70 bg-background hover:bg-destructive/10"
            title="Delete channel"
          >
            <DeleteIcon />
          </button>
        </div>
      )}
    </div>
  )
}

/** Manage Channel Sheet Component */
function ManageChannelSheet({
  sheet,
  formData,
  onOpenChange,
  onSave,
  onDelete,
  onNameChange,
  onTypeChange,
  onActiveChange,
  onCopy,
  copiedCode,
  isSaving,
}: {
  sheet: { open: boolean; app: App | null; channel: Channel | null }
  formData: { name: string; type: string; isActive: boolean }
  onOpenChange: (open: boolean) => void
  onSave: () => void
  onDelete: () => void
  onNameChange: (name: string) => void
  onTypeChange: (type: string) => void
  onActiveChange: (isActive: boolean) => void
  onCopy: (text: string, key: string) => void
  copiedCode: string | null
  isSaving: boolean
}) {
  if (!sheet.app || !sheet.channel) return null

  const config = getChannelConfig(sheet.channel.type)

  return (
    <Sheet open={sheet.open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto px-6 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Manage Channel</SheetTitle>
          <SheetDescription>
            Edit channel settings or view integration documentation
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="edit" className="mt-4 w-full">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="edit">
              <EditIcon />
              Edit
            </TabsTrigger>
            <TabsTrigger value="integration">
              <CodeIcon />
              Integration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 py-4">
            {/* Channel Info */}
            {config && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-lg",
                    config.bgLight,
                    config.bgDark
                  )}
                >
                  <config.icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{sheet.channel.name}</div>
                  <div className={cn("text-sm", config.color)}>
                    {config.label}
                  </div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manageChannelName">Name *</Label>
                <Input
                  id="manageChannelName"
                  value={formData.name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="e.g., Website Form"
                  className="rounded-lg border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manageChannelType">Type *</Label>
                <Select value={formData.type} onValueChange={onTypeChange}>
                  <SelectTrigger
                    id="manageChannelType"
                    className="rounded-lg border border-input bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_TYPE_OPTIONS.map((option) => {
                      const Icon = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", option.color)} />
                            {option.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable this channel for ticket creation
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={onActiveChange}
                />
              </div>
            </div>

            <SheetFooter className="gap-2 sm:justify-end">
              <Button variant="destructive" onClick={onDelete}>
                <DeleteIcon />
                Delete Channel
              </Button>
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </SheetFooter>
          </TabsContent>

          <TabsContent value="integration" className="py-4">
            <IntegrationGuideContent
              app={sheet.app}
              channel={sheet.channel}
              copiedCode={copiedCode}
              onCopy={onCopy}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

/** Integration Guide Content */
function IntegrationGuideContent({
  app,
  channel,
  copiedCode,
  onCopy,
}: {
  app: App
  channel: Channel
  copiedCode: string | null
  onCopy: (text: string, key: string) => void
}) {
  const code = getIntegrationCode(app, channel)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3">
        <CodeIcon />
        <div className="flex-1">
          <div className="font-medium">{code.title}</div>
          <div className="text-sm text-muted-foreground">
            {code.description}
          </div>
        </div>
      </div>

      {channel.type === "INTEGRATED_APP" && <SecurityWarning />}

      {code.sections.map((section, idx) => (
        <div key={idx} className="space-y-2">
          <h4 className="text-sm font-medium">{section.title}</h4>
          <CodeBlock
            code={section.content}
            isCode={section.isCode}
            copied={copiedCode === `code-${idx}`}
            onCopy={() => onCopy(section.content, `code-${idx}`)}
          />
        </div>
      ))}

      {channel.type === "WEB_FORM" && (
        <div className="rounded-lg border p-4">
          <h4 className="mb-2 text-sm font-medium">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <a
              href={`/support/tickets/new?app=${app.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Form
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

/** Security Warning for API Keys */
function SecurityWarning() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
      <div className="flex items-start gap-2">
        <span className="text-amber-500">⚠️</span>
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Important:</strong> Keep your API Key secure. Do not share it
          publicly or commit it to version control.
        </div>
      </div>
    </div>
  )
}

/** Code Block with Copy Button */
function CodeBlock({
  code,
  isCode,
  copied,
  onCopy,
}: {
  code: string
  isCode: boolean
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
        <code>{code}</code>
      </pre>
      {isCode && (
        <button
          onClick={onCopy}
          className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-md bg-background shadow transition-opacity hover:bg-accent"
          aria-label="Copy code"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      )}
    </div>
  )
}

// ============================================================================
// Icon Components (simplified for reusability)
// ============================================================================

function EditIcon() {
  return <Edit className="mr-2 h-4 w-4" />
}

function DeleteIcon() {
  return <Trash2 className="mr-2 h-4 w-4" />
}

function CopyIcon() {
  return <Copy className="h-4 w-4 text-muted-foreground" />
}

function CheckIcon() {
  return <Check className="h-4 w-4 text-green-500" />
}

function CodeIcon() {
  return <Code className="mr-2 h-4 w-4" />
}
