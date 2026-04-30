# Ticket Context and Follow-up Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate the ticket's initial intake context from follow-up conversation so the first report is rendered as an immutable context block and never mixed into the chat thread.

**Architecture:** Introduce one small ticket-presentation helper that can split a ticket into `initialContext` and follow-up messages, including a legacy fallback path for old tickets that still have the intake text stored in the first message. Then update ticket creation so new tickets persist the intake only on the `Ticket` record, update read APIs to return the split shape, and finally update the internal and public detail UIs to render context and conversation as separate sections.

**Tech Stack:** Next.js App Router, Prisma, PostgreSQL, React, Vitest, existing ticketing service layer and route handlers.

---

### Task 1: Add a reusable ticket presentation helper

**Files:**

- Create: `lib/services/ticketing/ticket-context.ts`
- Create: `lib/services/ticketing/__tests__/ticket-context.test.ts`
- Modify: `lib/services/ticketing/types.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest"
import { splitTicketDetail } from "@/lib/services/ticketing/ticket-context"

describe("splitTicketDetail", () => {
  it("keeps structured context separate from follow-up messages", () => {
    const result = splitTicketDetail({
      ticket: {
        ticketNumber: "NAIE-00001",
        subject: "Login failure",
        description: "The app crashes after submit",
        metadata: {
          initialContextVersion: 1,
          ticketType: "BUG_REPORT",
          templateFields: { steps: "Open the app" },
        },
        guestName: "Ada",
        guestEmail: "ada@example.com",
        guestPhone: "+62 812 0000 0000",
        attachments: [
          {
            url: "https://cdn.example.com/first.png",
            name: "first.png",
            type: "image/png",
            size: 1234,
          },
        ],
      },
      messages: [
        {
          id: "m1",
          sender: "CUSTOMER",
          message: "Thanks, I will try that.",
          isInternal: false,
          createdAt: new Date("2026-04-30T10:00:00.000Z"),
        },
      ],
    })

    expect(result.initialContext.ticketNumber).toBe("NAIE-00001")
    expect(result.initialContext.description).toBe(
      "The app crashes after submit"
    )
    expect(result.initialContext.ticketType).toBe("BUG_REPORT")
    expect(result.messages).toHaveLength(1)
    expect(result.messages[0]?.id).toBe("m1")
  })

  it("uses the first visible customer message as legacy intake context", () => {
    const result = splitTicketDetail({
      ticket: {
        ticketNumber: "NAIE-00002",
        subject: "Need help",
        description: null,
        metadata: null,
        guestName: "Rina",
        guestEmail: "rina@example.com",
        guestPhone: null,
        attachments: [],
      },
      messages: [
        {
          id: "m1",
          sender: "CUSTOMER",
          message: "I cannot reset my password",
          isInternal: false,
          createdAt: new Date("2026-04-30T09:00:00.000Z"),
        },
        {
          id: "m2",
          sender: "AGENT",
          message: "Please check your inbox",
          isInternal: false,
          createdAt: new Date("2026-04-30T09:15:00.000Z"),
        },
      ],
    })

    expect(result.initialContext.description).toBe("I cannot reset my password")
    expect(result.messages.map((msg) => msg.id)).toEqual(["m2"])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run lib/services/ticketing/__tests__/ticket-context.test.ts -t splitTicketDetail`

Expected: FAIL because `splitTicketDetail` does not exist yet.

- [ ] **Step 3: Implement the helper and shared types**

```ts
export interface TicketInitialContext {
  ticketNumber: string
  subject: string
  description: string | null
  ticketType?: string
  templateFields: Record<string, string>
  requester: {
    name: string | null
    email: string | null
    phone: string | null
  }
  attachments: Array<{
    url: string
    name: string
    type: string
    size: number
  }>
  source: "structured" | "legacy"
}

export function splitTicketDetail(input: {
  ticket: {
    ticketNumber: string
    subject: string
    description: string | null
    metadata: Record<string, unknown> | null
    guestName: string | null
    guestEmail: string | null
    guestPhone: string | null
    attachments: Array<{
      file?: {
        serveUrl?: string | null
        cdnUrl?: string | null
        storagePath?: string | null
        originalFilename?: string
        mimeType?: string
        size?: number
      }
      url?: string
      name?: string
      type?: string
      size?: number
    }>
  }
  messages: Array<{
    id: string
    sender: string
    message: string
    isInternal: boolean
    createdAt: Date
  }>
}) {
  return {
    initialContext: {
      ticketNumber: input.ticket.ticketNumber,
      subject: input.ticket.subject,
      description:
        input.ticket.description ??
        input.messages.find(
          (msg) => msg.sender === "CUSTOMER" && !msg.isInternal
        )?.message ??
        null,
      ticketType:
        typeof input.ticket.metadata?.ticketType === "string"
          ? input.ticket.metadata.ticketType
          : undefined,
      templateFields:
        input.ticket.metadata?.templateFields &&
        typeof input.ticket.metadata.templateFields === "object"
          ? (input.ticket.metadata.templateFields as Record<string, string>)
          : {},
      requester: {
        name: input.ticket.guestName,
        email: input.ticket.guestEmail,
        phone: input.ticket.guestPhone,
      },
      attachments: input.ticket.attachments.map((attachment) => ({
        url:
          attachment.file?.serveUrl ??
          attachment.file?.cdnUrl ??
          attachment.file?.storagePath ??
          attachment.url ??
          "",
        name:
          attachment.file?.originalFilename ?? attachment.name ?? "attachment",
        type:
          attachment.file?.mimeType ??
          attachment.type ??
          "application/octet-stream",
        size: attachment.file?.size ?? attachment.size ?? 0,
      })),
      source:
        input.ticket.metadata?.initialContextVersion === 1
          ? "structured"
          : "legacy",
    },
    messages: input.messages.filter((msg, index) => {
      if (input.ticket.metadata?.initialContextVersion === 1) {
        return true
      }

      const firstCustomerMessageIndex = input.messages.findIndex(
        (candidate) => candidate.sender === "CUSTOMER" && !candidate.isInternal
      )
      return index !== firstCustomerMessageIndex
    }),
  }
}
```

- [ ] **Step 4: Run the test again**

Run: `pnpm exec vitest run lib/services/ticketing/__tests__/ticket-context.test.ts`

Expected: PASS with both structured and legacy cases.

- [ ] **Step 5: Commit the helper**

```bash
git add lib/services/ticketing/ticket-context.ts lib/services/ticketing/__tests__/ticket-context.test.ts lib/services/ticketing/types.ts
git commit -m "feat(ticketing): add ticket context splitter"
```

### Task 2: Stop creating an initial chat message on ticket creation

**Files:**

- Modify: `lib/services/ticketing/ticket-service.ts`
- Modify: `lib/services/ticketing/types.ts`
- Modify: `app/api/public/tickets/route.ts`
- Modify: `app/support/tickets/new/page.tsx`
- Modify: `app/support/tickets/new/components/smart-ticket-form.tsx`
- Create: `lib/services/ticketing/__tests__/ticket-service.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi, beforeEach } from "vitest"
import { createTicket } from "@/lib/services/ticketing/ticket-service"
import { prisma } from "@/lib/prisma"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    app: { findUnique: vi.fn() },
    channel: { findFirst: vi.fn() },
    ticket: { count: vi.fn(), create: vi.fn() },
  },
}))

describe("createTicket", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("stores the intake on the ticket record and does not create an initial message", async () => {
    ;(prisma.app.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "app-1",
      slug: "support",
      isActive: true,
    })
    ;(prisma.channel.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "channel-1",
      appId: "app-1",
      isActive: true,
    })
    ;(prisma.ticket.count as ReturnType<typeof vi.fn>).mockResolvedValue(0)
    ;(prisma.ticket.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "ticket-1",
      ticketNumber: "SUPP-00001",
      createdAt: new Date(),
    })

    await createTicket({
      appId: "app-1",
      channelId: "channel-1",
      subject: "Login failure",
      message: "Initial report body",
      description: undefined,
      priority: "NORMAL" as any,
      guestInfo: { email: "ada@example.com", name: "Ada" },
      ticketType: "BUG_REPORT",
      metadata: { templateFields: { steps: "Open the app" } },
    })

    expect(prisma.ticket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subject: "Login failure",
          description: "Initial report body",
          metadata: expect.objectContaining({
            ticketType: "BUG_REPORT",
            templateFields: { steps: "Open the app" },
            initialContextVersion: 1,
          }),
        }),
      })
    )

    expect(
      (prisma.ticket.create as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
        ?.data?.messages
    ).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run lib/services/ticketing/__tests__/ticket-service.test.ts -t stores the intake`

Expected: FAIL because `createTicket` still writes `messages.create`.

- [ ] **Step 3: Update the service and public create route**

```ts
// lib/services/ticketing/ticket-service.ts
const ticketMetadata: Record<string, unknown> = {
  ...(metadata || {}),
}

if (ticketType) {
  ticketMetadata.ticketType = ticketType
}

ticketMetadata.templateFields =
  (metadata?.templateFields as Record<string, string> | undefined) || {}
ticketMetadata.initialContextVersion = 1

const ticket = await prisma.ticket.create({
  data: {
    ticketNumber,
    appId,
    channelId,
    subject,
    description: description ?? message,
    priority: ticketPriority,
    status: TicketStatus.OPEN,
    metadata:
      Object.keys(ticketMetadata).length > 0 ? ticketMetadata : undefined,
    activities: {
      create: {
        action: ActivityAction.CREATED,
        userId: createdBy || userId,
      },
    },
  },
})
```

```ts
// app/api/public/tickets/route.ts
const ticket = await createTicket({
  appId: app.id,
  channelId: channel.id,
  subject: validated.subject,
  description: validated.description,
  message: validated.message,
  attachments: validated.attachments,
  priority: validated.priority,
  userId: finalUserId,
  guestInfo: finalGuestInfo,
  createdBy: finalUserId,
  externalUserId: tokenPayload?.externalUserId,
  ticketType,
  metadata,
})
```

```ts
// app/support/tickets/new/page.tsx
const buildInitialContextBody = (
  type: TicketType | null,
  fields: Record<string, string>
) => {
  if (!type) return ""

  const config = getTicketTypeConfig(type)
  let context = ""

  config?.fields.forEach((field) => {
    if (fields[field.name]) {
      context += `**${field.label}:**\n${fields[field.name]}\n\n`
    }
  })

  return context.trim()
}
```

```ts
// app/support/tickets/new/components/smart-ticket-form.tsx
<Label className="text-sm font-medium">Initial Context</Label>
```

- [ ] **Step 4: Run the test again**

Run: `pnpm exec vitest run lib/services/ticketing/__tests__/ticket-service.test.ts`

Expected: PASS and the mocked `ticket.create` payload has no `messages.create`.

- [ ] **Step 5: Commit the ticket creation change**

```bash
git add lib/services/ticketing/ticket-service.ts lib/services/ticketing/types.ts app/api/public/tickets/route.ts app/support/tickets/new/page.tsx app/support/tickets/new/components/smart-ticket-form.tsx lib/services/ticketing/__tests__/ticket-service.test.ts
git commit -m "feat(ticketing): store intake on ticket record"
```

### Task 3: Update read APIs to return structured context and follow-up-only messages

**Files:**

- Modify: `lib/services/ticketing/types.ts`
- Modify: `lib/services/ticketing/ticket-service.ts`
- Modify: `app/api/tickets/[id]/route.ts`
- Modify: `app/api/tickets/[id]/messages/route.ts`
- Modify: `app/api/integrated/tickets/[id]/route.ts`
- Modify: `app/api/integrated/tickets/[id]/messages/route.ts`
- Modify: `app/api/public/tickets/[id]/status/route.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest"
import { splitTicketDetail } from "@/lib/services/ticketing/ticket-context"

describe("ticket detail response shape", () => {
  it("returns an initialContext block and a follow-up-only message list", () => {
    const result = splitTicketDetail({
      ticket: {
        ticketNumber: "NAIE-00003",
        subject: "Billing question",
        description: "Need help understanding this invoice",
        metadata: {
          initialContextVersion: 1,
          ticketType: "BILLING_INQUIRY",
          templateFields: { invoiceNumber: "INV-123" },
        },
        guestName: "Budi",
        guestEmail: "budi@example.com",
        guestPhone: null,
        attachments: [],
      },
      messages: [
        {
          id: "m1",
          sender: "CUSTOMER",
          message: "First follow-up",
          isInternal: false,
          createdAt: new Date("2026-04-30T10:00:00.000Z"),
        },
      ],
    })

    expect(result.initialContext.ticketType).toBe("BILLING_INQUIRY")
    expect(result.messages.map((msg) => msg.id)).toEqual(["m1"])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run lib/services/ticketing/__tests__/ticket-context.test.ts -t returns an initialContext block`

Expected: FAIL until the API layer is wired to use the helper and return the split shape.

- [ ] **Step 3: Update the service return type and read routes**

```ts
// lib/services/ticketing/types.ts
export interface TicketDetail {
  id: string
  ticketNumber: string
  subject: string
  description: string | null
  initialContext: TicketInitialContext
  status: TicketStatus
  priority: Priority
  createdAt: Date
  updatedAt: Date
  resolvedAt: Date | null
  closedAt: Date | null
  assignedAt: Date | null
  messages: TicketMessage[]
  activities: TicketActivity[]
}
```

```ts
// lib/services/ticketing/ticket-service.ts
const { initialContext, messages: followUpMessages } = splitTicketDetail({
  ticket,
  messages: ticket.messages.map((message) => ({
    id: message.id,
    sender: message.sender,
    message: message.message,
    isInternal: message.isInternal,
    createdAt: message.createdAt,
  })),
})

return {
  ...ticket,
  initialContext,
  messages: followUpMessages,
  sla: calculateTicketSla(ticket),
}
```

```ts
// app/api/tickets/[id]/messages/route.ts
const ticket = await prisma.ticket.findUnique({ where: { id } })
const messages = await getTicketMessages(id)
const { messages: followUpMessages } = splitTicketDetail({ ticket, messages })
return NextResponse.json({
  items: followUpMessages,
  total: followUpMessages.length,
  page: query.page,
  pageSize: query.pageSize,
  totalPages: Math.ceil(followUpMessages.length / query.pageSize),
})
```

```ts
// app/api/integrated/tickets/[id]/route.ts
const ticket = await prisma.ticket.findUnique({
  where: { id: ticketId },
  include: {
    messages: { where: { isInternal: false }, orderBy: { createdAt: "asc" } },
    attachments: { include: { file: true } },
    channel: { include: { app: true } },
  },
})
const { initialContext, messages } = splitTicketDetail({
  ticket,
  messages: ticket.messages.map((msg) => ({
    id: msg.id,
    sender: msg.sender,
    message: msg.message,
    isInternal: msg.isInternal,
    createdAt: msg.createdAt,
  })),
})
return NextResponse.json({
  success: true,
  ticket: {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    initialContext,
    messages: messages.map((msg) => ({
      id: msg.id,
      sender: msg.sender,
      message: msg.message,
      isInternal: msg.isInternal,
      createdAt: msg.createdAt,
    })),
  },
})
```

- [ ] **Step 4: Run the read-path checks**

Run:
`pnpm exec vitest run lib/services/ticketing/__tests__/ticket-context.test.ts`

Run:
`pnpm run typecheck`

Expected: both commands pass after the routes and service types compile against the new shape.

- [ ] **Step 5: Commit the read-path update**

```bash
git add lib/services/ticketing/types.ts lib/services/ticketing/ticket-service.ts app/api/tickets/[id]/route.ts app/api/tickets/[id]/messages/route.ts app/api/integrated/tickets/[id]/route.ts app/api/integrated/tickets/[id]/messages/route.ts app/api/public/tickets/[id]/status/route.ts
git commit -m "feat(ticketing): split ticket context from thread"
```

### Task 4: Update internal and public ticket detail UIs

**Files:**

- Modify: `app/(dashboard)/tickets/[id]/components/ticket-detail.tsx`
- Modify: `app/(dashboard)/tickets/[id]/components/ticket-messages.tsx`
- Modify: `app/support/tickets/[id]/components/ticket-detail-public.tsx`

- [ ] **Step 1: Write the failing test**

Update the component prop contracts so the old single-thread usage no longer type-checks:

```tsx
export function TicketMessages({
  ticketId,
  messages,
  onUpdate,
}: {
  ticketId: string
  messages: TicketMessage[]
  onUpdate: () => void
}) {
  return null
}
```

```tsx
export function TicketDetailPublic({ ticketId, token }: Props) {
  const ticket = data.ticket
  const { initialContext } = ticket
  return <div>{initialContext.description}</div>
}
```

- [ ] **Step 2: Run the test to verify the UI branch has no coverage yet**

Run: `pnpm exec vitest run`

Expected: the current single-thread component usage should fail type-checking until the prop updates are implemented.

- [ ] **Step 3: Update the components to consume the split response**

```tsx
// app/(dashboard)/tickets/[id]/components/ticket-messages.tsx
export function TicketMessages({
  ticketId,
  messages,
  onUpdate,
}: {
  ticketId: string
  messages: TicketMessage[]
  onUpdate: () => void
}) {
  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [messages]
  )
}
```

```tsx
// app/(dashboard)/tickets/[id]/components/ticket-detail.tsx
const ticket = data.ticket
const initialContext = ticket.initialContext
<Card>
  <CardContent>
    <h3>Context Utama</h3>
    <p>{initialContext.description}</p>
  </CardContent>
</Card>
<TicketMessages ticketId={ticketId} messages={ticket.messages} onUpdate={refetch} />
```

```tsx
// app/support/tickets/[id]/components/ticket-detail-public.tsx
const ticket = data.ticket
const { initialContext } = ticket
<Card>
  <CardHeader>
    <CardTitle className="text-lg">Context Utama</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="whitespace-pre-wrap">{initialContext.description}</p>
  </CardContent>
</Card>
<Card>
  <CardHeader>
    <CardTitle className="text-lg">Percakapan</CardTitle>
  </CardHeader>
  <CardContent>
    {ticket.messages.map((msg) => (
      <div key={msg.id}>{msg.message}</div>
    ))}
  </CardContent>
</Card>
```

- [ ] **Step 4: Run the UI and type checks**

Run:
`pnpm run typecheck`

Run:
`pnpm run lint`

Expected: both commands pass after the prop changes and new render structure compile cleanly.

- [ ] **Step 5: Commit the UI refresh**

```bash
git add app/(dashboard)/tickets/[id]/components/ticket-detail.tsx app/(dashboard)/tickets/[id]/components/ticket-messages.tsx app/support/tickets/[id]/components/ticket-detail-public.tsx
git commit -m "feat(ticketing): separate intake context from follow-up chat"
```
