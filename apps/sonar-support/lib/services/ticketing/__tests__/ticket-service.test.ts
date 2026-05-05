import { describe, expect, it, vi, beforeEach } from "vitest"
import { Priority } from "@prisma/client"
import { createTicket } from "../ticket-service"

const prismaMock = vi.hoisted(() => ({
  app: {
    findUnique: vi.fn(),
  },
  channel: {
    findFirst: vi.fn(),
  },
  ticket: {
    count: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock(
  "/home/acn/refactor/support/bandanaiera/apps/naiera-support/lib/prisma",
  () => ({
    prisma: prismaMock,
  })
)

vi.mock("../webhook-service", () => ({
  triggerWebhook: vi.fn(),
}))

vi.mock("../notification-service", () => ({
  notifyAgentTicketCreated: vi.fn(),
  notifyCustomerTicketUpdate: vi.fn(),
  notifyCustomerTicketCreated: vi.fn(),
}))

describe("createTicket", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("stores the intake on the ticket record and does not create an initial message", async () => {
    ;(prismaMock.app.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "app-1",
      slug: "support",
      isActive: true,
    })
    ;(
      prismaMock.channel.findFirst as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: "channel-1",
      appId: "app-1",
      isActive: true,
    })
    ;(prismaMock.ticket.count as ReturnType<typeof vi.fn>).mockResolvedValue(0)
    ;(prismaMock.ticket.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "ticket-1",
      ticketNumber: "SUPP-00001",
      createdAt: new Date("2026-04-30T00:00:00.000Z"),
      status: "OPEN",
      priority: Priority.NORMAL,
      sla: {
        status: "ON_TRACK",
        targetAt: new Date("2026-04-30T01:00:00.000Z"),
        remainingMinutes: 60,
        elapsedMinutes: 0,
        targetMinutes: 60,
      },
    })

    await createTicket({
      appId: "app-1",
      channelId: "channel-1",
      subject: "Login failure",
      description: undefined,
      message: "Initial report body",
      priority: Priority.NORMAL,
      guestInfo: { email: "ada@example.com", name: "Ada" },
      attachments: [
        {
          id: "file-1",
          url: "https://cdn.example.com/first.png",
          name: "first.png",
          type: "image/png",
          size: 1234,
        },
      ],
      ticketType: "BUG_REPORT",
      metadata: { templateFields: { steps: "Open the app" } },
    })

    expect(prismaMock.ticket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subject: "Login failure",
          description: "Initial report body",
          metadata: expect.objectContaining({
            ticketType: "BUG_REPORT",
            templateFields: { steps: "Open the app" },
            initialContextVersion: 1,
          }),
          attachments: expect.objectContaining({
            create: [
              expect.objectContaining({
                file: {
                  connect: {
                    id: "file-1",
                  },
                },
              }),
            ],
          }),
        }),
      })
    )

    expect(
      (prismaMock.ticket.create as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]
        ?.data?.messages
    ).toBeUndefined()
  })
})
