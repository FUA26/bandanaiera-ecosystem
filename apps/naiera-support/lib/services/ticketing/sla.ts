import { Priority, TicketStatus } from "@prisma/client"

export type SlaStatus = "ON_TRACK" | "DUE_SOON" | "BREACHED" | "COMPLETED"

export interface TicketSla {
  status: SlaStatus
  targetAt: Date
  remainingMinutes: number
  elapsedMinutes: number
  targetMinutes: number
}

const SLA_TARGET_MINUTES: Record<Priority, number> = {
  LOW: 72 * 60,
  NORMAL: 24 * 60,
  HIGH: 8 * 60,
  URGENT: 2 * 60,
}

const COMPLETED_STATUSES: TicketStatus[] = [
  TicketStatus.RESOLVED,
  TicketStatus.CLOSED,
]

export function getSlaTargetMinutes(priority: Priority): number {
  return SLA_TARGET_MINUTES[priority] ?? SLA_TARGET_MINUTES.NORMAL
}

export function calculateSlaTargetAt(
  priority: Priority,
  createdAt: Date
): Date {
  return new Date(
    new Date(createdAt).getTime() + getSlaTargetMinutes(priority) * 60 * 1000
  )
}

export function calculateTicketSla(ticket: {
  priority: Priority
  status: TicketStatus
  createdAt: Date
  slaTargetAt?: Date | null
  slaBreachedAt?: Date | null
  resolvedAt?: Date | null
  closedAt?: Date | null
}): TicketSla {
  const targetMinutes = getSlaTargetMinutes(ticket.priority)
  const startedAt = new Date(ticket.createdAt)
  const targetAt = ticket.slaTargetAt
    ? new Date(ticket.slaTargetAt)
    : calculateSlaTargetAt(ticket.priority, startedAt)
  const completedAt = ticket.closedAt ?? ticket.resolvedAt ?? null
  const referenceAt = completedAt ?? new Date()
  const elapsedMinutes = Math.max(
    0,
    Math.floor((referenceAt.getTime() - startedAt.getTime()) / (1000 * 60))
  )
  const remainingMinutes = Math.floor(
    (targetAt.getTime() - referenceAt.getTime()) / (1000 * 60)
  )

  if (COMPLETED_STATUSES.includes(ticket.status)) {
    return {
      status: remainingMinutes < 0 ? "BREACHED" : "COMPLETED",
      targetAt,
      remainingMinutes,
      elapsedMinutes,
      targetMinutes,
    }
  }

  if (remainingMinutes < 0) {
    return {
      status: "BREACHED",
      targetAt,
      remainingMinutes,
      elapsedMinutes,
      targetMinutes,
    }
  }

  if (remainingMinutes <= Math.max(60, Math.floor(targetMinutes * 0.2))) {
    return {
      status: "DUE_SOON",
      targetAt,
      remainingMinutes,
      elapsedMinutes,
      targetMinutes,
    }
  }

  return {
    status: "ON_TRACK",
    targetAt,
    remainingMinutes,
    elapsedMinutes,
    targetMinutes,
  }
}

export function formatSlaDuration(minutes: number): string {
  const absoluteMinutes = Math.abs(minutes)
  const days = Math.floor(absoluteMinutes / (24 * 60))
  const hours = Math.floor((absoluteMinutes % (24 * 60)) / 60)
  const mins = absoluteMinutes % 60

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}
