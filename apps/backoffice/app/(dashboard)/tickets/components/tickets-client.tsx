/**
 * Tickets Management Page - Using Custom DataTable
 *
 * Client component for managing support tickets with custom data table.
 */

"use client"

import { useMemo } from "react"
import { MessageSquare, User, Clock } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRightIcon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { type ColumnDef } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { TicketStatus, Priority } from "@prisma/client"
import type { TicketWithRelations } from "@/lib/services/ticketing/types"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableFacetedFilter,
  DataTableViewOptions,
  type FacetedFilterOption,
} from "@/components/admin/data-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

// ============================================================================
// Constants
// ============================================================================

const statusColors: Record<string, string> = {
  OPEN: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  IN_PROGRESS:
    "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20",
  RESOLVED:
    "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20",
  CLOSED: "bg-muted/60 text-muted-foreground border-border hover:bg-muted",
}

const priorityColors: Record<string, string> = {
  LOW: "bg-muted/60 text-muted-foreground border-border hover:bg-muted",
  NORMAL: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
  HIGH: "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20",
  URGENT:
    "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
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

interface TicketsClientProps {
  tickets: TicketWithRelations[]
  currentUserId: string
}

export function TicketsClient({ tickets, currentUserId }: TicketsClientProps) {
  const router = useRouter()

  // Stats
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "OPEN").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      resolved: tickets.filter((t) => t.status === "RESOLVED").length,
      urgent: tickets.filter(
        (t) => t.priority === "URGENT" && t.status !== "CLOSED"
      ).length,
    }
  }, [tickets])

  // Column definitions
  const columns: ColumnDef<TicketWithRelations>[] = useMemo(
    () => [
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">
            Manage customer support tickets
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatsCard
          label="Total"
          value={stats.total}
          icon={MessageSquare}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatsCard
          label="Open"
          value={stats.open}
          icon={MessageSquare}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatsCard
          label="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="text-warning"
          bgColor="bg-warning/10"
        />
        <StatsCard
          label="Resolved"
          value={stats.resolved}
          icon={MessageSquare}
          color="text-success"
          bgColor="bg-success/10"
        />
        <StatsCard
          label="Urgent"
          value={stats.urgent}
          icon={MessageSquare}
          color="text-destructive"
          bgColor="bg-destructive/10"
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={tickets}
        columns={columns}
        enableRowSelection={false}
        enablePagination={true}
        toolbar={(table) => {
          // Check if any filter is active
          const isFiltered =
            table.getState().columnFilters.length > 0 ||
            (table.getColumn("subject")?.getFilterValue() as string)?.length > 0

          return (
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Search tickets..."
                  value={
                    (table.getColumn("subject")?.getFilterValue() as string) ??
                    ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn("subject")
                      ?.setFilterValue(event.target.value)
                  }
                  className="w-[200px] sm:w-[240px]"
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
                    <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
              <DataTableViewOptions table={table} />
            </div>
          )
        }}
      />
    </div>
  )
}

// ============================================================================
// Sub Components
// ============================================================================

/** Stats Card Component */
function StatsCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}) {
  return (
    <div className="card-interactive p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            bgColor
          )}
        >
          <Icon className={cn("size-5", color)} />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  )
}
