-- Migration: Add Task Management Module
-- Date: 2026-04-28

-- Create TaskStatus enum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'ARCHIVED');

-- Create TaskPriority enum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Create TaskActivityAction enum
CREATE TYPE "TaskActivityAction" AS ENUM ('CREATED', 'UPDATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNED', 'UNASSIGNED', 'COMMENT_ADDED', 'ATTACHMENT_ADDED', 'TAG_ADDED', 'TAG_REMOVED', 'DELETED', 'DUE_DATE_CHANGED');

-- Create Task table
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigneeId" TEXT,
    "createdById" TEXT NOT NULL,
    "ticketId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Task
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_priority_idx" ON "Task"("priority");
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");
CREATE INDEX "Task_createdAt_idx" ON "Task"("createdAt");
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");
CREATE INDEX "Task_ticketId_idx" ON "Task"("ticketId");

-- Create TaskTag table
CREATE TABLE "TaskTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskTag_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TaskTag_name_key" UNIQUE ("name")
);

-- Create indexes for TaskTag
CREATE INDEX "TaskTag_name_idx" ON "TaskTag"("name");

-- Create TaskTaskTag junction table
CREATE TABLE "TaskTaskTag" (
    "taskId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "TaskTaskTag_pkey" PRIMARY KEY ("taskId", "tagId")
);

-- Create indexes for TaskTaskTag
CREATE INDEX "TaskTaskTag_taskId_idx" ON "TaskTaskTag"("taskId");
CREATE INDEX "TaskTaskTag_tagId_idx" ON "TaskTaskTag"("tagId");

-- Create TaskComment table
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "attachmentId" TEXT,

    CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
);

-- Create indexes for TaskComment
CREATE INDEX "TaskComment_taskId_idx" ON "TaskComment"("taskId");
CREATE INDEX "TaskComment_authorId_idx" ON "TaskComment"("authorId");
CREATE INDEX "TaskComment_createdAt_idx" ON "TaskComment"("createdAt");
CREATE INDEX "TaskComment_attachmentId_idx" ON "TaskComment"("attachmentId");

-- Create TaskAttachment table
CREATE TABLE "TaskAttachment" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "TaskAttachment_pkey" PRIMARY KEY ("id")
);

-- Create indexes for TaskAttachment
CREATE INDEX "TaskAttachment_taskId_idx" ON "TaskAttachment"("taskId");
CREATE INDEX "TaskAttachment_fileId_idx" ON "TaskAttachment"("fileId");

-- Create TaskActivity table
CREATE TABLE "TaskActivity" (
    "id" TEXT NOT NULL,
    "action" "TaskActivityAction" NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TaskActivity_pkey" PRIMARY KEY ("id")
);

-- Create indexes for TaskActivity
CREATE INDEX "TaskActivity_taskId_idx" ON "TaskActivity"("taskId");
CREATE INDEX "TaskActivity_userId_idx" ON "TaskActivity"("userId");
CREATE INDEX "TaskActivity_createdAt_idx" ON "TaskActivity"("createdAt");
CREATE INDEX "TaskActivity_action_idx" ON "TaskActivity"("action");

-- Add Foreign Keys
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TaskTaskTag" ADD CONSTRAINT "TaskTaskTag_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskTaskTag" ADD CONSTRAINT "TaskTaskTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "TaskTag"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "TaskAttachment"(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TaskAttachment" ADD CONSTRAINT "TaskAttachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskAttachment" ADD CONSTRAINT "TaskAttachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- Add relations to existing tables
ALTER TABLE "TaskTag" ADD CONSTRAINT "TaskTag_tasks_fkey" FOREIGN KEY ("id") REFERENCES "TaskTaskTag"("tagId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_tags_fkey" FOREIGN KEY ("id") REFERENCES "TaskTaskTag"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_comments_fkey" FOREIGN KEY ("id") REFERENCES "TaskComment"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_attachments_fkey" FOREIGN KEY ("id") REFERENCES "TaskAttachment"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_activities_fkey" FOREIGN KEY ("id") REFERENCES "TaskActivity"("taskId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User" ADD CONSTRAINT "User_createdTasks_fkey" FOREIGN KEY ("id") REFERENCES "Task"("createdById") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_assignedTasks_fkey" FOREIGN KEY ("id") REFERENCES "Task"("assigneeId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_taskComments_fkey" FOREIGN KEY ("id") REFERENCES "TaskComment"("authorId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_taskActivities_fkey" FOREIGN KEY ("id") REFERENCES "TaskActivity"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "File" ADD CONSTRAINT "File_taskAttachments_fkey" FOREIGN KEY ("id") REFERENCES "TaskAttachment"("fileId") ON DELETE CASCADE ON UPDATE CASCADE;
