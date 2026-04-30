/**
 * Tickets Management Page - Using Custom DataTable
 *
 * Client component for managing support tickets with custom data table.
 */

"use client"

import { useMemo } from "react"
import { MessageSquare, User, Clock } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRightIcon } from "@hugeicons/core-free-icons"
import { type ColumnDef } from "@tanstack/react-table"
import { endOfDay, format, formatDistanceToNow, startOfDay } from "date-fns"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { TicketWithRelations } from "@/lib/services/ticketing/types"
import {
  DataTable,
  DataTableActionBar,
  DataTableColumnHeader,
  DataTableDateFilter,
  DataTableFacetedFilter,
  DataTablePaginationSummary,
  DataTableViewOptions,
  type FacetedFilterOption,
} from "@/components/admin/data-table"
import { Card, CardContent } from "@workspace/ui"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

// ============================================================================
// Constants
// ============================================================================

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

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
}

const STATUS_OPTIONS: FacetedFilterOption[] = [
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
]

const PRIORITY_OPTIONS: FacetedFilterOption[] = [
  { label: "Low", value: "LOW" },
  { label: "Normal", value: "NORMAL" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
]

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

interface DateFilterValue {
  from?: Date
  to?: Date
}

function matchesDateFilter(
  value: string | Date | number,
  filterValue?: DateFilterValue
) {
  if (!filterValue?.from) return true

  const rowDate = new Date(value)
  const fromDate = startOfDay(new Date(filterValue.from))
  const toDate = endOfDay(new Date(filterValue.to ?? filterValue.from))

  return rowDate >= fromDate && rowDate <= toDate
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

interface TicketsClientProps {
  tickets: TicketWithRelations[]
  currentUserId: string
}

export function TicketsClient({ tickets }: TicketsClientProps) {
  const router = useRouter()

  // Stats
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    }
  }, [tickets])

  // Column definitions
  const columns: ColumnDef<TicketWithRelations>[] = useMemo(
    () => [
      {
        id: "select",
        size: 40,
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) =>
              table.toggleAllPageRowsSelected(!!e.target.checked)
            }
            className="translate-y-[2px]"
            aria-label="Select all tickets"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="translate-y-[2px]"
            aria-label={`Select ticket ${row.original.ticketNumber}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "ticketNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Ticket" />
        ),
        cell: ({ row }) => (
          <div className="font-mono text-sm whitespace-nowrap">
            #{row.getValue("ticketNumber")}
          </div>
        ),
        size: 100,
      },
      {
        accessorKey: "subject",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Subject" />
        ),
        cell: ({ row }) => (
          <div
            className="max-w-[250px] truncate font-medium"
            title={row.getValue("subject")}
          >
            {row.getValue("subject")}
          </div>
        ),
        size: 250,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Created Date" />
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"))
          return (
            <div className="flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{format(date, "d MMM yyyy")}</span>
            </div>
          )
        },
        filterFn: (row, columnId, filterValue: DateFilterValue) =>
          matchesDateFilter(row.getValue(columnId), filterValue),
        size: 140,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          return (
            <Badge className={statusColors[status]}>
              {statusLabels[status] || status}
            </Badge>
          )
        },
        filterFn: (row, columnId, filterValue: string[]) => {
          const status = row.getValue(columnId) as string
          return filterValue.includes(status)
        },
        size: 100,
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Priority" />
        ),
        cell: ({ row }) => {
          const priority = row.getValue("priority") as string
          return <Badge className={priorityColors[priority]}>{priority}</Badge>
        },
        filterFn: (row, columnId, filterValue: string[]) => {
          const priority = row.getValue(columnId) as string
          return filterValue.includes(priority)
        },
        size: 80,
      },
      {
        id: "sla",
        accessorFn: (row) => row.sla?.status ?? "ON_TRACK",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="SLA" />
        ),
        cell: ({ row }) => {
          const sla = row.original.sla
          if (!sla) return <span className="text-muted-foreground">—</span>

          const isBreached = sla.status === "BREACHED"
          const remainingLabel = isBreached
            ? `${formatSlaDuration(sla.remainingMinutes)} late`
            : `${formatSlaDuration(sla.remainingMinutes)} left`

          return (
            <div className="flex flex-col gap-1">
              <Badge className={slaColors[sla.status]}>
                {slaLabels[sla.status] || sla.status}
              </Badge>
              <span className="text-xs whitespace-nowrap text-muted-foreground">
                {sla.status === "COMPLETED" ? "Completed" : remainingLabel}
              </span>
            </div>
          )
        },
        filterFn: (row, columnId, filterValue: string[]) => {
          const slaStatus = row.getValue(columnId) as string
          return filterValue.includes(slaStatus)
        },
        size: 110,
      },
      {
        accessorKey: "customer",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Customer" />
        ),
        cell: ({ row }) => {
          const customer = row.original.customer
          const name = customer.user?.name || customer.guestName
          const email = customer.user?.email || customer.guestEmail

          return (
            <div className="flex items-center gap-2">
              {name ? (
                <>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="max-w-[140px] min-w-0">
                    <div className="truncate text-sm font-medium" title={name}>
                      {name}
                    </div>
                    {email && email !== name && (
                      <div
                        className="truncate text-xs text-muted-foreground"
                        title={email}
                      >
                        {email}
                      </div>
                    )}
                  </div>
                </>
              ) : email ? (
                <div
                  className="max-w-[140px] min-w-0 truncate text-sm text-muted-foreground"
                  title={email}
                >
                  {email}
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          )
        },
        size: 200,
      },
      {
        accessorKey: "assignedTo",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Assigned To" />
        ),
        cell: ({ row }) => {
          const assignedTo = row.original.assignedTo
          return (
            <div className="flex items-center gap-2">
              {assignedTo?.name ? (
                <>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xs font-medium text-primary">
                      {assignedTo.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="truncate text-sm" title={assignedTo.name}>
                    {assignedTo.name}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Unassigned
                </span>
              )}
            </div>
          )
        },
        size: 140,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Last Updated" />
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("updatedAt"))
          return (
            <div className="flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
            </div>
          )
        },
        filterFn: (row, columnId, filterValue: DateFilterValue) =>
          matchesDateFilter(row.getValue(columnId), filterValue),
        size: 140,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/tickets/${row.original.id}`)}
              className="gap-1.5 whitespace-nowrap"
            >
              View
              <HugeiconsIcon icon={ArrowRightIcon} className="h-3.5 w-3.5" />
            </Button>
          )
        },
        enableSorting: false,
        size: 80,
      },
    ],
    [router]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Tickets</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Track customer support tickets with a simple overview and focused
            filtering.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Tickets"
          value={stats.total}
          icon={MessageSquare}
          tone="primary"
        />
        <StatCard
          label="Open"
          value={stats.open}
          icon={MessageSquare}
          tone="secondary"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Clock}
          tone="warning"
        />
      </div>

      <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <DataTable
            data={tickets}
            columns={columns}
            enablePagination={true}
            defaultDensity="short"
            toolbar={(table) => {
              const isFiltered =
                table.getState().columnFilters.length > 0 ||
                (table.getColumn("subject")?.getFilterValue() as string)
                  ?.length > 0

              return (
                <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      placeholder="Search tickets..."
                      value={
                        (table
                          .getColumn("subject")
                          ?.getFilterValue() as string) ?? ""
                      }
                      onChange={(event) =>
                        table
                          .getColumn("subject")
                          ?.setFilterValue(event.target.value)
                      }
                      className="h-10 w-full sm:w-[220px]"
                    />
                    <DataTableFacetedFilter
                      title="Status"
                      options={STATUS_OPTIONS}
                      column={table.getColumn("status")}
                    />
                    <DataTableFacetedFilter
                      title="Priority"
                      options={PRIORITY_OPTIONS}
                      column={table.getColumn("priority")}
                    />
                    <DataTableDateFilter
                      title="Created"
                      mode="range"
                      column={table.getColumn("createdAt")}
                    />
                    <DataTableDateFilter
                      title="Updated"
                      mode="range"
                      column={table.getColumn("updatedAt")}
                    />
                    {isFiltered && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          table.resetColumnFilters()
                          table.getColumn("subject")?.setFilterValue("")
                        }}
                        className="gap-1.5"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-end">
                    <DataTableViewOptions table={table} />
                  </div>
                </div>
              )
            }}
            paginationLeftContent={(table) => (
              <DataTablePaginationSummary
                table={table}
                itemLabelSingular="ticket"
                itemLabelPlural="tickets"
              />
            )}
            actionBar={(table) => <DataTableActionBar table={table} />}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// Sub Components
// ============================================================================

/** Stats Card Component */
function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  tone: "primary" | "secondary" | "warning"
}) {
  const toneStyles = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    warning: "bg-warning/10 text-warning",
  }[tone]

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            toneStyles
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <div className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
            {label}
          </div>
        </div>
      </div>
    </div>
  )
}
