-- Migration: Add Ticketing Module
-- Date: 2026-04-28

-- Create ChannelType enum
CREATE TYPE "ChannelType" AS ENUM ('WEB_FORM', 'PUBLIC_LINK', 'WIDGET', 'INTEGRATED_APP', 'WHATSAPP', 'TELEGRAM');

-- Create TicketStatus enum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- Create Priority enum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- Create SenderType enum
CREATE TYPE "SenderType" AS ENUM ('CUSTOMER', 'AGENT', 'SYSTEM');

-- Create ActivityAction enum
CREATE TYPE "ActivityAction" AS ENUM ('CREATED', 'STATUS_CHANGED', 'ASSIGNED', 'PRIORITY_CHANGED', 'NOTE_ADDED', 'CUSTOMER_REPLIED', 'AGENT_REPLIED', 'CLOSED', 'REOPENED');

-- Create WebhookEvent enum
CREATE TYPE "WebhookEvent" AS ENUM ('TICKET_CREATED', 'TICKET_UPDATED', 'MESSAGE_ADDED', 'STATUS_CHANGED', 'ASSIGNED');

-- Create App table
CREATE TABLE "App" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "App_slug_key" UNIQUE ("slug")
);

-- Create indexes for App
CREATE INDEX "App_slug_idx" ON "App"("slug");
CREATE INDEX "App_isActive_idx" ON "App"("isActive");

-- Create Channel table
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "type" "ChannelType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "apiKey" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Channel_apiKey_key" UNIQUE ("apiKey"),
    CONSTRAINT "Channel_slug_key" UNIQUE ("slug")
);

-- Create indexes for Channel
CREATE INDEX "Channel_appId_idx" ON "Channel"("appId");
CREATE INDEX "Channel_isActive_idx" ON "Channel"("isActive");
CREATE INDEX "Channel_apiKey_idx" ON "Channel"("apiKey");
CREATE INDEX "Channel_slug_idx" ON "Channel"("slug");

-- Create Ticket table
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT,
    "externalUserId" VARCHAR(255),
    "guestEmail" VARCHAR(255),
    "guestName" VARCHAR(255),
    "guestPhone" VARCHAR(50),
    "subject" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" TEXT,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Ticket_ticketNumber_key" UNIQUE ("ticketNumber")
);

-- Create indexes for Ticket
CREATE INDEX "Ticket_appId_idx" ON "Ticket"("appId");
CREATE INDEX "Ticket_channelId_idx" ON "Ticket"("channelId");
CREATE INDEX "Ticket_userId_idx" ON "Ticket"("userId");
CREATE INDEX "Ticket_externalUserId_idx" ON "Ticket"("externalUserId");
CREATE INDEX "Ticket_assignedTo_idx" ON "Ticket"("assignedTo");
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");
CREATE INDEX "Ticket_priority_idx" ON "Ticket"("priority");
CREATE INDEX "Ticket_status_assignedTo_idx" ON "Ticket"("status", "assignedTo");
CREATE INDEX "Ticket_createdAt_idx" ON "Ticket"("createdAt");
CREATE INDEX "Ticket_ticketNumber_idx" ON "Ticket"("ticketNumber");
CREATE INDEX "Ticket_ticketId_idx" ON "Ticket"("ticketId");

-- Create TicketMessage table
CREATE TABLE "TicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "sender" "SenderType" NOT NULL,
    "userId" TEXT,
    "message" TEXT NOT NULL,
    "attachments" JSONB,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

-- Create indexes for TicketMessage
CREATE INDEX "TicketMessage_ticketId_idx" ON "TicketMessage"("ticketId");
CREATE INDEX "TicketMessage_createdAt_idx" ON "TicketMessage"("createdAt");

-- Create TicketAttachment table
CREATE TABLE "TicketAttachment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketAttachment_pkey" PRIMARY KEY ("id")
);

-- Create indexes for TicketAttachment
CREATE INDEX "TicketAttachment_ticketId_idx" ON "TicketAttachment"("ticketId");
CREATE INDEX "TicketAttachment_fileId_idx" ON "TicketAttachment"("fileId");

-- Create TicketActivity table
CREATE TABLE "TicketActivity" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "userId" TEXT,
    "changes" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketActivity_pkey" PRIMARY KEY ("id")
);

-- Create indexes for TicketActivity
CREATE INDEX "TicketActivity_ticketId_idx" ON "TicketActivity"("ticketId");
CREATE INDEX "TicketActivity_createdAt_idx" ON "TicketActivity"("createdAt");

-- Create Webhook table
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" "WebhookEvent"[] NOT NULL DEFAULT '{}',
    "secret" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Webhook
CREATE INDEX "Webhook_appId_idx" ON "Webhook"("appId");
CREATE INDEX "Webhook_isActive_idx" ON "Webhook"("isActive");

-- Create WebhookLog table
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT,
    "ticketId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "event" "WebhookEvent" NOT NULL,
    "payload" JSONB NOT NULL,
    "statusCode" INTEGER,
    "response" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- Create indexes for WebhookLog
CREATE INDEX "WebhookLog_ticketId_idx" ON "WebhookLog"("ticketId");
CREATE INDEX "WebhookLog_webhookId_idx" ON "WebhookLog"("webhookId");
CREATE INDEX "WebhookLog_sentAt_idx" ON "WebhookLog"("sentAt");

-- Add Foreign Keys
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Task"(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TicketAttachment" ADD CONSTRAINT "TicketAttachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketAttachment" ADD CONSTRAINT "TicketAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TicketActivity" ADD CONSTRAINT "TicketActivity_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketActivity" ADD CONSTRAINT "TicketActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Add relations to existing tables
ALTER TABLE "App" ADD CONSTRAINT "App_userAssignments_fkey" FOREIGN KEY ("id") REFERENCES "UserApp"("appId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "App" ADD CONSTRAINT "App_accessRequests_fkey" FOREIGN KEY ("id") REFERENCES "AppAccessRequest"("appId") ON DELETE CASCADE ON UPDATE CASCADE;
