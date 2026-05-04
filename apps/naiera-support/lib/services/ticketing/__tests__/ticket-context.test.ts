import { describe, expect, it } from "vitest"
import { splitTicketDetail } from "../ticket-context"
import type { TicketMetadata } from "../types"

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
    expect(result.initialContext.templateFields).toEqual({
      steps: "Open the app",
    })
    expect(result.initialContext.requester).toEqual({
      name: "Ada",
      email: "ada@example.com",
      phone: "+62 812 0000 0000",
    })
    expect(result.initialContext.attachments).toEqual([
      {
        url: "https://cdn.example.com/first.png",
        name: "first.png",
        type: "image/png",
        size: 1234,
      },
    ])
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
          id: "m0",
          sender: "AGENT",
          message: "Internal note",
          isInternal: true,
          createdAt: new Date("2026-04-30T08:55:00.000Z"),
        },
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
    expect(result.initialContext.source).toBe("legacy")
    expect(result.messages.map((msg) => msg.id)).toEqual(["m0", "m2"])
  })

  it("normalizes attachment objects that already contain file metadata", () => {
    const result = splitTicketDetail({
      ticket: {
        ticketNumber: "NAIE-00003",
        subject: "Billing issue",
        description: "Invoice is missing",
        metadata: {
          initialContextVersion: 1,
          templateFields: {},
        },
        guestName: null,
        guestEmail: null,
        guestPhone: null,
        attachments: [
          {
            file: {
              id: "file-1",
              serveUrl: "/api/files/file-1/serve",
              cdnUrl: "https://cdn.example.com/file-1.pdf",
              storagePath: "tickets/file-1.pdf",
              originalFilename: "receipt.pdf",
              mimeType: "application/pdf",
              size: 2048,
            },
          },
        ],
      },
      messages: [],
    })

    expect(result.initialContext.attachments).toEqual([
      {
        url: "/api/files/file-1/serve",
        name: "receipt.pdf",
        type: "application/pdf",
        size: 2048,
      },
    ])
  })

  it("includes attachment snapshots from metadata as part of the initial context", () => {
    const result = splitTicketDetail({
      ticket: {
        ticketNumber: "NAIE-00007",
        subject: "Metadata attachments",
        description: "Body",
        metadata: {
          initialContextVersion: 1,
          templateFields: {},
          attachments: [
            {
              url: "https://cdn.example.com/context.pdf",
              name: "context.pdf",
              type: "application/pdf",
              size: 4096,
            },
          ],
        },
        guestName: null,
        guestEmail: null,
        guestPhone: null,
        attachments: [],
      },
      messages: [],
    })

    expect(result.initialContext.attachments).toEqual([
      {
        url: "https://cdn.example.com/context.pdf",
        name: "context.pdf",
        type: "application/pdf",
        size: 4096,
      },
    ])
  })

  it("falls back to safe attachment defaults when fields are empty strings", () => {
    const result = splitTicketDetail({
      ticket: {
        ticketNumber: "NAIE-00006",
        subject: "Malformed attachments",
        description: "Body",
        metadata: {
          initialContextVersion: 1,
          templateFields: {},
        },
        guestName: null,
        guestEmail: null,
        guestPhone: null,
        attachments: [
          {
            file: {
              serveUrl: "",
              cdnUrl: "",
              storagePath: "",
              originalFilename: "",
              mimeType: "",
              size: 0,
            },
            url: "",
            name: "",
            type: "",
            size: 0,
          },
        ],
      },
      messages: [],
    })

    expect(result.initialContext.attachments).toEqual([
      {
        url: "",
        name: "attachment",
        type: "application/octet-stream",
        size: 0,
      },
    ])
  })

  it("drops malformed templateFields values and keeps only string entries", () => {
    const arrayMetadata = {
      initialContextVersion: 1,
      templateFields: ["bad", "worse"],
    } as unknown as TicketMetadata

    const arrayResult = splitTicketDetail({
      ticket: {
        ticketNumber: "NAIE-00004",
        subject: "Array template fields",
        description: "Body",
        metadata: arrayMetadata,
        guestName: null,
        guestEmail: null,
        guestPhone: null,
        attachments: [],
      },
      messages: [],
    })

    expect(arrayResult.initialContext.templateFields).toEqual({})

    const mixedMetadata = {
      initialContextVersion: 1,
      templateFields: {
        steps: "Open the app",
        count: 2,
        nested: { value: "ignore" },
        files: ["ignore"],
        empty: null,
      },
    } as unknown as TicketMetadata

    const mixedResult = splitTicketDetail({
      ticket: {
        ticketNumber: "NAIE-00005",
        subject: "Mixed template fields",
        description: "Body",
        metadata: mixedMetadata,
        guestName: null,
        guestEmail: null,
        guestPhone: null,
        attachments: [],
      },
      messages: [],
    })

    expect(mixedResult.initialContext.templateFields).toEqual({
      steps: "Open the app",
    })
  })
})
