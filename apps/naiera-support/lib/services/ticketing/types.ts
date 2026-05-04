/**
 * Ticket Module - Type Definitions
 *
 * Type definitions for ticketing service layer.
 * Includes input types, response types, and query parameters.
 */

import {
  TicketStatus,
  Priority,
  ChannelType,
  SenderType,
  ActivityAction,
  WebhookEvent,
} from "@prisma/client"

// ============================================================================
// Input Types
// ============================================================================

export interface CreateTicketInput {
  appId: string
  channelId: string
  subject: string
  description?: string
  message: string
  priority?: Priority
  userId?: string
  guestInfo?: {
    email: string
    name?: string
    phone?: string
  }
  attachments?: Array<{
    id?: string
    fileId?: string
    url: string
    name: string
    type: string
    size: number
  }>
  createdBy?: string
  externalUserId?: string // For integrated app customers
  ticketType?: string // Ticket type (e.g., BUG_REPORT, FEATURE_REQUEST)
  metadata?: Record<string, unknown> // Additional metadata including templateFields
}

export interface UpdateTicketInput {
  status?: TicketStatus
  assignedTo?: string | null
  priority?: Priority
}

export interface AddMessageInput {
  ticketId: string
  sender: SenderType
  message: string
  userId?: string
  attachments?: Array<{ url: string; name: string; type: string; size: number }>
  isInternal?: boolean
}

export interface TicketAttachmentFile {
  id?: string
  serveUrl?: string | null
  cdnUrl?: string | null
  storagePath?: string | null
  originalFilename?: string
  mimeType?: string
  size?: number
}

export interface TicketAttachment {
  file?: TicketAttachmentFile | null
  url?: string
  name?: string
  type?: string
  size?: number
}

export interface TicketMetadata extends Record<string, unknown> {
  ticketType?: string
  templateFields?: Record<string, string>
  initialContextVersion?: 1
  attachments?: TicketAttachment[]
}

export interface TicketRequesterSnapshot {
  name: string | null
  email: string | null
  phone: string | null
}

export interface TicketInitialContext {
  ticketNumber: string
  subject: string
  description: string | null
  ticketType?: string
  templateFields: Record<string, string>
  requester: TicketRequesterSnapshot
  attachments: Array<{
    url: string
    name: string
    type: string
    size: number
  }>
  source: "structured" | "legacy"
}

// ============================================================================
// Response Types
// ============================================================================

export interface TicketWithRelations {
  id: string
  ticketNumber: string
  subject: string
  status: TicketStatus
  priority: Priority
  sla: {
    status: "ON_TRACK" | "DUE_SOON" | "BREACHED" | "COMPLETED"
    targetAt: Date
    remainingMinutes: number
    elapsedMinutes: number
    targetMinutes: number
  }
  createdAt: Date
  updatedAt: Date
  app: {
    id: string
    name: string
    slug: string
  }
  channel: {
    id: string
    type: ChannelType
    name: string
  }
  customer: {
    userId?: string
    guestEmail?: string
    guestName?: string
    guestPhone?: string
    user?: {
      id: string
      name: string | null
      email: string
    }
  }
  assignedTo?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface TicketDetail {
  id: string
  ticketNumber: string
  subject: string
  description: string | null
  status: TicketStatus
  priority: Priority
  sla: {
    status: "ON_TRACK" | "DUE_SOON" | "BREACHED" | "COMPLETED"
    targetAt: Date
    remainingMinutes: number
    elapsedMinutes: number
    targetMinutes: number
  }
  createdAt: Date
  updatedAt: Date
  resolvedAt: Date | null
  closedAt: Date | null
  assignedAt: Date | null
  app: {
    id: string
    name: string
    slug: string
  }
  channel: {
    id: string
    type: ChannelType
    name: string
  }
  customer: {
    userId?: string
    guestEmail?: string
    guestName?: string
    guestPhone?: string
    name?: string
    email?: string
    avatar?: string
  }
  assignedTo?: {
    id: string
    name: string
    avatar?: string
  }
  metadata?: TicketMetadata | null
  attachments?: TicketAttachment[]
  messages: TicketMessage[]
  activities: TicketActivity[]
}

export interface TicketMessage {
  id: string
  sender: SenderType
  message: string
  attachments?: Array<{ url: string; name: string; type: string; size: number }>
  isInternal: boolean
  createdAt: Date
  user?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface TicketActivity {
  id: string
  action: ActivityAction
  changes?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  createdAt: Date
  user?: {
    id: string
    name: string
    avatar?: string
  }
}

// ============================================================================
// Query Types
// ============================================================================

export interface ListTicketsParams {
  page?: number
  pageSize?: number
  appId?: string
  status?: TicketStatus
  assignedTo?: string // "mine" | "unassigned" | userId
  search?: string
  sortBy?: "createdAt" | "updatedAt" | "priority"
}

export interface PaginatedTickets {
  items: TicketWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================================
// Export Enums for Convenience
// ============================================================================

export type {
  TicketStatus,
  Priority,
  ChannelType,
  SenderType,
  ActivityAction,
  WebhookEvent,
}
