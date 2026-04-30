# Ticket Context and Follow-up Separation Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate the ticket's initial intake context from later conversation replies so the first report is shown as a stable context block, not mixed into the chat thread.

**Architecture:** The ticket record remains the source of truth for the initial report, while `TicketMessage` becomes a pure follow-up thread. Ticket creation will stop auto-inserting the first customer message. Instead, the creation payload will populate `Ticket.subject`, `Ticket.description`, `Ticket.metadata`, requester fields, and attachments. Detail views will render a dedicated "Context Utama" section above a separate "Percakapan" section. Legacy tickets keep working by falling back to the first non-internal message when no structured intake context exists.

**Tech Stack:** Next.js App Router, Prisma, PostgreSQL, React, existing ticketing service layer, existing public/integrated ticket routes.

---

## Current State

- Public ticket creation currently stores the initial intake twice:
  - once in `Ticket` fields and `metadata`
  - once again as the first `TicketMessage`
- Public and internal ticket detail pages render a single chronological message list, so intake text and follow-up replies are visually blended together.
- Ticket categories and form templates are still hardcoded in `lib/ticketing/form-templates.ts` and `lib/ticketing/ticket-types.ts`.
- App/channel setup is already database-backed through `App` and `Channel`, and it controls where tickets belong, not which intake categories exist.

## Desired Behavior

1. The initial ticket submission is stored as structured ticket context.
2. Follow-up replies are stored only in `TicketMessage`.
3. The detail view clearly separates:
   - context block
   - conversation thread
4. Existing tickets remain readable after the change.

## Non-Goals

- Do not move ticket type/category definitions into the database in this change.
- Do not redesign app/channel setup.
- Do not add a new table for intake context unless the existing ticket fields become insufficient later.

## Data Model

Use the existing schema:

- `Ticket.subject` for the main ticket title.
- `Ticket.description` for the intake summary/body.
- `Ticket.metadata` for structured context such as:
  - `ticketType`
  - `templateFields`
  - optional `initialContextVersion`
- Existing requester fields stay on `Ticket`:
  - `userId`
  - `guestEmail`
  - `guestName`
  - `guestPhone`
- `TicketAttachment` continues to store attachments.
- `TicketMessage` continues to store only follow-up conversation and internal notes.

### Structured metadata shape

Use a stable payload inside `Ticket.metadata`:

```ts
type TicketMetadata = {
  ticketType?: string
  templateFields?: Record<string, string>
  initialContextVersion?: 1
}
```

## API Changes

### `POST /api/public/tickets`

Current behavior:

- creates the ticket
- creates the first customer message

New behavior:

- creates the ticket only
- stores initial intake data in `Ticket` fields and `metadata`
- does not create a `TicketMessage` during creation

The request body may continue to send:

- `subject`
- `message`
- `ticketType`
- `metadata.templateFields`
- requester info
- attachments

Interpretation:

- `message` becomes the initial context body and maps to `Ticket.description`
- `templateFields` remain in `metadata`

### `GET /api/integrated/tickets/[id]`

Return two distinct payload sections:

- `initialContext`
  - ticket identity
  - subject
  - description
  - metadata
  - requester snapshot
  - initial attachments
- `messages`
  - follow-up messages only

For legacy tickets that already have an initial customer message and no structured context:

- synthesize `initialContext` from the ticket plus the first visible customer message
- keep the remaining messages as the follow-up thread

### Internal ticket detail fetches

Any internal ticket detail query that currently requests `messages` should receive the same separation:

- `initialContext` from ticket fields
- `messages` as the follow-up thread

## UI Changes

### Public ticket detail view

Update the public ticket page to render:

1. `Context Utama`
   - ticket number
   - subject
   - ticket type
   - requester identity
   - attachment summary
   - initial intake body
   - template fields rendered in a readable form
2. `Percakapan`
   - follow-up messages only
3. Reply box stays attached to the conversation thread

### Internal ticket detail view

Update the agent-facing detail page to use the same two-section structure:

- top panel for immutable intake context
- lower panel for chronological conversation

Internal notes should remain visually distinct from customer/agent replies.

## Compatibility Rules

- If a ticket has `metadata.initialContextVersion === 1`, render the structured context block directly.
- If the metadata is missing or old:
  - treat the oldest customer-authored visible message as the intake body
  - do not show that message again in the conversation thread
- Existing APIs that add follow-up messages remain unchanged.

## Service Layer Changes

### `lib/services/ticketing/ticket-service.ts`

- Remove the automatic `messages.create` inside `createTicket`.
- Keep ticket number generation, SLA setup, webhook trigger, and notification flow.
- Ensure `metadata` is persisted with the new structured context shape.

### `lib/services/ticketing/ticket-message-service.ts`

- Leave message creation behavior intact.
- Keep automatic reopen behavior and notification behavior unchanged.
- This service should remain focused on post-creation conversation only.

## Migration and Rollout

No database migration is required for the first pass because the existing schema already has the necessary fields.

Rollout order:

1. Update ticket creation so new tickets stop creating the initial message.
2. Update read APIs to return `initialContext` separately.
3. Update public and internal ticket detail UIs.
4. Add fallback handling for legacy tickets.

## Testing

Add coverage for:

1. Ticket creation does not create an initial `TicketMessage`.
2. Ticket creation persists initial intake into `Ticket.description` and `Ticket.metadata`.
3. Public ticket detail API returns `initialContext` and a follow-up-only `messages` array.
4. Legacy tickets still render a usable context block.
5. Follow-up message posting still appends to `TicketMessage` and does not alter the initial context block.

## Open Implementation Notes

- The category selector remains code-configured for now.
- App setup remains the database-backed source of truth for app/channel routing.
- If a future requirement needs app-specific ticket types, that should be a separate design change.
