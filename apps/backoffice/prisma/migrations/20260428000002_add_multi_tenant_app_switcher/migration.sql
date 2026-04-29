-- Migration: Add Multi-Tenant App Switcher
-- Date: 2026-04-28

-- Create UserApp table (junction table for user-app assignments)
CREATE TABLE "UserApp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserApp_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserApp_userId_appId_key" UNIQUE ("userId", "appId")
);

-- Create indexes for UserApp
CREATE INDEX "UserApp_userId_idx" ON "UserApp"("userId");
CREATE INDEX "UserApp_appId_idx" ON "UserApp"("appId");

-- Create AppAccessRequest table
CREATE TABLE "AppAccessRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "AppAccessRequest_pkey" PRIMARY KEY ("id")
);

-- Create indexes for AppAccessRequest
CREATE INDEX "AppAccessRequest_userId_idx" ON "AppAccessRequest"("userId");
CREATE INDEX "AppAccessRequest_status_idx" ON "AppAccessRequest"("status");

-- Add Foreign Keys
ALTER TABLE "UserApp" ADD CONSTRAINT "UserApp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserApp" ADD CONSTRAINT "UserApp_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AppAccessRequest" ADD CONSTRAINT "AppAccessRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "AppAccessRequest" ADD CONSTRAINT "AppAccessRequest_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"(id) ON UPDATE CASCADE ON UPDATE CASCADE;

-- Add relations to User table
ALTER TABLE "User" ADD CONSTRAINT "User_assignedApps_fkey" FOREIGN KEY ("id") REFERENCES "UserApp"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_accessRequests_fkey" FOREIGN KEY ("id") REFERENCES "AppAccessRequest"("userId") ON UPDATE CASCADE ON DELETE CASCADE;

-- Add relations to App table
ALTER TABLE "App" ADD CONSTRAINT "App_userAssignments_fkey" FOREIGN KEY ("id") REFERENCES "UserApp"("appId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "App" ADD CONSTRAINT "App_accessRequests_fkey" FOREIGN KEY ("id") REFERENCES "AppAccessRequest"("appId") ON DELETE CASCADE ON UPDATE CASCADE;
