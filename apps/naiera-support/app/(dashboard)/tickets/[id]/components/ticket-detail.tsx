"use client"

import { useQuery } from "@tanstack/react-query"
import { TicketMessages } from "./ticket-messages"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { AttachmentPreview } from "@/components/ticketing/attachment-preview"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
import { Card, CardContent } from "@workspace/ui"
import { ArrowLeftIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Props {
  ticketId: string
  currentUserId: string
}

const slaColors: Record<string, string> = {
  ON_TRACK:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15",
  COMPLETED:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15",
  DUE_SOON:
    "bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/15",
  BREACHED:
    "bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/15",
}

const slaLabels: Record<string, string> = {
  ON_TRACK: "On track",
  DUE_SOON: "Due soon",
  BREACHED: "Breached",
  COMPLETED: "Met",
}

const statusColors: Record<string, string> = {
  OPEN: "bg-sky-500/10 text-sky-700 border-sky-500/20 hover:bg-sky-500/15",
  IN_PROGRESS:
    "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/15",
  RESOLVED:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/15",
  CLOSED:
    "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 hover:bg-zinc-500/15",
}

const priorityColors: Record<string, string> = {
  LOW: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 hover:bg-zinc-500/15",
  NORMAL: "bg-sky-500/10 text-sky-700 border-sky-500/20 hover:bg-sky-500/15",
  HIGH: "bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/15",
  URGENT:
    "bg-rose-500/10 text-rose-700 border-rose-500/20 hover:bg-rose-500/15",
}

function formatSlaDuration(minutes: number) {
  const absoluteMinutes = Math.abs(minutes)
  const days = Math.floor(absoluteMinutes / (24 * 60))
  const hours = Math.floor((absoluteMinutes % (24 * 60)) / 60)
  const mins = absoluteMinutes % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function TicketDetail({ ticketId, currentUserId }: Props) {
  const router = useRouter()
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)

  const updateTicket = async (updates: {
    status?: string
    assignedTo?: string | null
    priority?: string
  }) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error("Failed to update")
      refetch()
    } finally {
      setIsUpdating(false)
    }
  }

  const claimTicket = async () => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: currentUserId }),
      })
      if (!res.ok) throw new Error("Failed to claim")
      refetch()
    } finally {
      setIsUpdating(false)
    }
  }

  const unassignTicket = async () => {
    setUnassignDialogOpen(false)
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: null }),
      })
      if (!res.ok) throw new Error("Failed to unassign")
      refetch()
    } finally {
      setIsUpdating(false)
    }
  }

  const closeTicket = async () => {
    setCloseDialogOpen(false)
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/close`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to close")
      refetch()
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  if (!data?.ticket) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
          <CardContent className="py-12 text-center">
            <h2 className="mb-2 text-xl font-semibold">Ticket Not Found</h2>
            <p className="text-muted-foreground">
              The ticket you&apos;re looking for doesn&apos;t exist.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ticket = data.ticket
  const assignedTo = ticket.assignedToUser || ticket.assignedTo // Handle both API responses
  const isAssignedToCurrentUser = assignedTo?.id === currentUserId
  const isUnassigned = !assignedTo
  const attachments = ticket.attachments as Array<{
    file: {
      id: string
      serveUrl?: string | null
      cdnUrl?: string | null
      storagePath?: string | null
      originalFilename: string
      mimeType: string
      size: number
    }
  }>

  return (
    <div className="space-y-6 p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="w-fit gap-1"
      >
        <HugeiconsIcon icon={ArrowLeftIcon} className="h-4 w-4" />
        Back to Tickets
      </Button>

      <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {ticket.subject}
                </h1>
                <Badge variant="outline">{ticket.ticketNumber}</Badge>
                <Badge variant="outline">{ticket.app.name}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {ticket.channel.type} • Created{" "}
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
              {attachments && attachments.length > 0 && (
                <div className="mt-3">
                  <AttachmentPreview
                    attachments={attachments.map((a) => ({
                      url:
                        a.file.serveUrl ||
                        a.file.cdnUrl ||
                        `/api/files/${a.file.id}/serve`,
                      name: a.file.originalFilename,
                      type: a.file.mimeType,
                      size: a.file.size,
                    }))}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {!isAssignedToCurrentUser && (
                <Button
                  onClick={claimTicket}
                  disabled={isUpdating}
                  variant="default"
                >
                  {isUnassigned ? "Claim Ticket" : "Take Over"}
                </Button>
              )}
              <Select
                value={ticket.priority}
                onValueChange={(value: string) =>
                  updateTicket({ priority: value })
                }
                disabled={isUpdating}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={ticket.status}
                onValueChange={(value: string) =>
                  updateTicket({ status: value })
                }
                disabled={isUpdating}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              {isAssignedToCurrentUser && (
                <Button
                  variant="outline"
                  onClick={() => setUnassignDialogOpen(true)}
                  disabled={isUpdating}
                >
                  Unassign
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setCloseDialogOpen(true)}
                disabled={isUpdating || ticket.status === "CLOSED"}
              >
                Close
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TicketMessages ticketId={ticketId} onUpdate={refetch} />
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <h3 className="mb-3 font-semibold">Customer</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Name: </span>
                    {ticket.user?.name || ticket.guestName || "Unknown"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email: </span>
                    {ticket.user?.email || ticket.guestEmail || "-"}
                  </p>
                  {ticket.guestPhone && (
                    <p>
                      <span className="text-muted-foreground">Phone: </span>
                      {ticket.guestPhone}
                    </p>
                  )}
                </div>
              </div>
              {ticket.sla && (
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <h3 className="mb-3 font-semibold">SLA</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span>Status</span>
                      <Badge className={slaColors[ticket.sla.status]}>
                        {slaLabels[ticket.sla.status] || ticket.sla.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Target</span>
                      <span>
                        {new Date(ticket.sla.targetAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Time left</span>
                      <span
                        className={
                          ticket.sla.remainingMinutes < 0
                            ? "font-medium text-destructive"
                            : undefined
                        }
                      >
                        {ticket.sla.remainingMinutes < 0
                          ? `${formatSlaDuration(ticket.sla.remainingMinutes)} late`
                          : `${formatSlaDuration(ticket.sla.remainingMinutes)} left`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <h3 className="mb-3 font-semibold">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge className={statusColors[ticket.status]}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Priority</span>
                    <Badge className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Assigned To</span>
                    {assignedTo ? (
                      <div className="flex items-center gap-2">
                        {assignedTo.name && <span>{assignedTo.name}</span>}
                        {isAssignedToCurrentUser && (
                          <Badge variant="secondary">You</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unassign Confirmation Dialog */}
      <AlertDialog
        open={unassignDialogOpen}
        onOpenChange={setUnassignDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unassign Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unassign this ticket? It will be
              available for others to claim.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={unassignTicket} disabled={isUpdating}>
              Unassign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Ticket Confirmation Dialog */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this ticket? You can reopen it
              later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={closeTicket} disabled={isUpdating}>
              Close Ticket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
