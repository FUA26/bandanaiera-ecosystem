"use client"

import { formatDistanceToNow } from "date-fns"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { useRouter } from "next/navigation"

const statusColors: Record<string, string> = {
  OPEN: "bg-primary/10 text-primary",
  IN_PROGRESS: "bg-secondary/10 text-secondary",
  RESOLVED: "bg-green-500/10 text-green-500",
  CLOSED: "bg-muted/60 text-muted-foreground",
}

const priorityColors: Record<string, string> = {
  LOW: "bg-muted/60 text-muted-foreground",
  NORMAL: "bg-primary/10 text-primary",
  HIGH: "bg-secondary/10 text-secondary",
  URGENT: "bg-destructive/10 text-destructive",
}

interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  app: { name: string }
  customer: {
    guestName?: string
    guestEmail?: string
    user?: { name?: string; email?: string }
  }
  assignedTo?: { name: string }
}

interface Props {
  tickets: Ticket[]
  isLoading: boolean
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function TicketTable({
  tickets,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
}: Props) {
  const router = useRouter()

  if (isLoading)
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading tickets...
      </div>
    )

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/tickets/${ticket.id}`)}
            >
              <TableCell className="font-mono text-sm">
                {ticket.ticketNumber}
              </TableCell>
              <TableCell className="font-medium">{ticket.subject}</TableCell>
              <TableCell>
                <Badge className={statusColors[ticket.status]}>
                  {ticket.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[ticket.priority]}>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {ticket.customer.user?.name ||
                  ticket.customer.guestName ||
                  ticket.customer.user?.email ||
                  ticket.customer.guestEmail ||
                  "-"}
              </TableCell>
              <TableCell>
                {ticket.assignedTo?.name || (
                  <span className="text-muted">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(ticket.updatedAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
