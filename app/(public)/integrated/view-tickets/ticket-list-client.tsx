/**
 * Ticket List Client Component
 *
 * Client component for displaying tickets in the integrated view
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@/lib/utils"

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  description: string | null
  status: string
  priority: string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  resolvedAt: string | null // ISO date string or null
  closedAt: string | null // ISO date string or null
  messages: Array<{
    id: string
    message: string
    sender: string
    createdAt: string
  }>
  _count: { messages: number }
}

interface TicketListClientProps {
  tickets: Ticket[]
  token: string
  channelName: string
  appName: string
}

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  OPEN: {
    label: "Open",
    color: "text-primary",
    bgColor: "bg-primary/10 dark:bg-primary/20",
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-secondary",
    bgColor: "bg-secondary/10 dark:bg-secondary/20",
    icon: Clock,
  },
  RESOLVED: {
    label: "Resolved",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    icon: CheckCircle2,
  },
  CLOSED: {
    label: "Closed",
    color: "text-muted-foreground",
    bgColor: "bg-muted/60 dark:bg-muted/30",
    icon: CheckCircle2,
  },
}

const priorityConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  LOW: {
    label: "Low",
    color: "text-muted-foreground",
    bgColor: "bg-muted/60 dark:bg-muted/30",
  },
  NORMAL: {
    label: "Normal",
    color: "text-primary",
    bgColor: "bg-primary/10 dark:bg-primary/20",
  },
  HIGH: {
    label: "High",
    color: "text-secondary",
    bgColor: "bg-secondary/10 dark:bg-secondary/20",
  },
  URGENT: {
    label: "Urgent",
    color: "text-destructive",
    bgColor: "bg-destructive/10 dark:bg-destructive/20",
  },
}

export function TicketListClient({
  tickets,
  token,
  channelName,
  appName,
}: TicketListClientProps) {
  const router = useRouter()
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total"
          value={stats.total}
          color="bg-muted/60 dark:bg-muted/30"
        />
        <StatCard
          label="Open"
          value={stats.open}
          color="bg-primary/10 dark:bg-primary/20"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          color="bg-secondary/10 dark:bg-secondary/20"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          color="bg-green-50 dark:bg-green-950"
        />
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <EmptyState token={token} appName={appName} />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const status = statusConfig[ticket.status] || statusConfig.OPEN
            const priority =
              priorityConfig[ticket.priority] || priorityConfig.NORMAL
            const StatusIcon = status?.icon

            return (
              <div
                key={ticket.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md dark:border-border dark:bg-card dark:hover:border-primary/20"
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn(
                      "flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl",
                      status?.bgColor
                    )}
                  >
                    <StatusIcon className={cn("h-6 w-6", status?.color)} />
                  </div>

                  {/* Content */}
                  <div
                    onClick={() => setSelectedTicket(ticket)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
                        #{ticket.ticketNumber}
                      </span>
                      <Badge
                        className={cn(
                          "shrink-0",
                          status?.bgColor,
                          status?.color,
                          "border-0"
                        )}
                      >
                        {status?.label}
                      </Badge>
                      <Badge
                        className={cn(
                          "shrink-0",
                          priority?.bgColor,
                          priority?.color,
                          "border-0"
                        )}
                      >
                        {priority?.label}
                      </Badge>
                    </div>

                    <h3 className="mb-1 truncate font-semibold text-slate-900 dark:text-white">
                      {ticket.subject}
                    </h3>

                    <p className="mb-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {ticket.description ||
                        ticket.messages[0]?.message ||
                        "No description"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                        <span>{ticket._count.messages} messages</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeAgo(ticket.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Open in new tab button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(
                        `/support/tickets/${ticket.id}?token=${token}`,
                        "_blank"
                      )
                    }}
                    className="shrink-0 gap-1.5 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="hidden sm:inline">Open</span>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-sm text-slate-500">
                    #{selectedTicket.ticketNumber}
                  </span>
                  <Badge
                    className={cn(
                      statusConfig[selectedTicket.status]?.bgColor,
                      statusConfig[selectedTicket.status]?.color,
                      "border-0"
                    )}
                  >
                    {statusConfig[selectedTicket.status]?.label}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">
                  {selectedTicket.subject}
                </DialogTitle>
                <DialogDescription>
                  Created {formatTimeAgo(selectedTicket.createdAt)}
                </DialogDescription>
              </DialogHeader>

              {/* Messages would go here - for now show description */}
              <div className="space-y-4">
                {selectedTicket.description && (
                  <div className="rounded-lg bg-muted/60 p-4 dark:bg-muted/30">
                    <p className="text-sm text-foreground/80 dark:text-foreground/80">
                      {selectedTicket.description}
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `/support/tickets/${selectedTicket.id}?token=${token}`,
                        "_blank"
                      )
                    }
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Full Conversation
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className={cn("rounded-xl p-4", color)}>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
    </div>
  )
}

function EmptyState({ token, appName }: { token: string; appName: string }) {
  const router = useRouter()
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm dark:border-border dark:bg-card">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
        No tickets yet
      </h3>
      <p className="mb-6 text-slate-500 dark:text-slate-400">
        You haven't created any support tickets yet.
      </p>
      <Button
        onClick={() => router.push(`/support/tickets/new?token=${token}`)}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Create Your First Ticket
      </Button>
    </div>
  )
}
