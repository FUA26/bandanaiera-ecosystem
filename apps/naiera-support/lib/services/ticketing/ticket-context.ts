import {
  TicketAttachment,
  TicketInitialContext,
  TicketMetadata,
  TicketRequesterSnapshot,
} from "./types"

export interface TicketDetailPresentationTicket {
  ticketNumber: string
  subject: string
  description: string | null
  metadata?: TicketMetadata | null
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
  attachments?: TicketAttachment[]
}

export interface TicketConversationMessage {
  id: string
  sender: string
  message: string
  isInternal: boolean
  createdAt: Date
}

export interface SplitTicketDetailInput<
  TMessage extends TicketConversationMessage = TicketConversationMessage,
> {
  ticket: TicketDetailPresentationTicket
  messages: TMessage[]
}

export interface SplitTicketDetailResult<
  TMessage extends TicketConversationMessage = TicketConversationMessage,
> {
  initialContext: TicketInitialContext
  messages: TMessage[]
}

function isStructuredContext(metadata?: TicketMetadata | null): boolean {
  return metadata?.initialContextVersion === 1
}

function normalizeRequester(
  ticket: TicketDetailPresentationTicket
): TicketRequesterSnapshot {
  return {
    name: ticket.guestName,
    email: ticket.guestEmail,
    phone: ticket.guestPhone,
  }
}

function normalizeAttachment(attachment: TicketAttachment) {
  const file = attachment.file ?? undefined

  return {
    url:
      file?.serveUrl ??
      file?.cdnUrl ??
      file?.storagePath ??
      attachment.url ??
      "",
    name: file?.originalFilename ?? attachment.name ?? "attachment",
    type: file?.mimeType ?? attachment.type ?? "application/octet-stream",
    size: file?.size ?? attachment.size ?? 0,
  }
}

function normalizeAttachments(attachments?: TicketAttachment[]) {
  return (attachments || []).map(normalizeAttachment)
}

function findFirstVisibleCustomerMessage<
  TMessage extends TicketConversationMessage,
>(messages: TMessage[]) {
  return messages.findIndex(
    (message) => message.sender === "CUSTOMER" && !message.isInternal
  )
}

function normalizeTemplateFields(
  metadata?: TicketMetadata | null
): Record<string, string> {
  const templateFields = metadata?.templateFields

  if (!templateFields || typeof templateFields !== "object") {
    return {}
  }

  return templateFields
}

export function splitTicketDetail<
  TMessage extends TicketConversationMessage = TicketConversationMessage,
>(input: SplitTicketDetailInput<TMessage>): SplitTicketDetailResult<TMessage> {
  const structured = isStructuredContext(input.ticket.metadata)
  const firstVisibleCustomerMessageIndex = findFirstVisibleCustomerMessage(
    input.messages
  )
  const legacyDescription =
    firstVisibleCustomerMessageIndex >= 0
      ? (input.messages[firstVisibleCustomerMessageIndex]?.message ?? null)
      : null

  return {
    initialContext: {
      ticketNumber: input.ticket.ticketNumber,
      subject: input.ticket.subject,
      description: structured
        ? input.ticket.description
        : (legacyDescription ?? input.ticket.description),
      ticketType:
        typeof input.ticket.metadata?.ticketType === "string"
          ? input.ticket.metadata.ticketType
          : undefined,
      templateFields: normalizeTemplateFields(input.ticket.metadata),
      requester: normalizeRequester(input.ticket),
      attachments: normalizeAttachments(input.ticket.attachments),
      source: structured ? "structured" : "legacy",
    },
    messages: structured
      ? [...input.messages]
      : input.messages.filter(
          (_, index) => index !== firstVisibleCustomerMessageIndex
        ),
  }
}
