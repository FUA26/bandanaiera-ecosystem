-- Migration: Update SystemSettings with new fields
-- Date: 2026-04-28

-- Add new columns to SystemSettings table
ALTER TABLE "SystemSettings" ADD COLUMN "siteLogoId" TEXT UNIQUE;
ALTER TABLE "SystemSettings" ADD COLUMN "siteSubtitle" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN "citizenName" TEXT DEFAULT 'Warga';
ALTER TABLE "SystemSettings" ADD COLUMN "heroBackgroundId" TEXT UNIQUE;
ALTER TABLE "SystemSettings" ADD COLUMN "contactAddress" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN "contactPhones" JSONB;
ALTER TABLE "SystemSettings" ADD COLUMN "contactEmails" JSONB;
ALTER TABLE "SystemSettings" ADD COLUMN "socialFacebook" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN "socialTwitter" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN "socialInstagram" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN "socialYouTube" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN "copyrightText" TEXT;
ALTER TABLE "SystemSettings" ADD COLUMN "versionNumber" TEXT DEFAULT '1.0.0';

-- Add indexes for new columns
CREATE INDEX "SystemSettings_siteLogoId_idx" ON "SystemSettings"("siteLogoId");
CREATE INDEX "SystemSettings_heroBackgroundId_idx" ON "SystemSettings"("heroBackgroundId");

-- Add Foreign Keys
ALTER TABLE "SystemSettings" ADD CONSTRAINT "SystemSettings_siteLogoId_fkey" FOREIGN KEY ("siteLogoId") REFERENCES "File"(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SystemSettings" ADD CONSTRAINT "SystemSettings_heroBackgroundId_fkey" FOREIGN KEY ("heroBackgroundId") REFERENCES "File"(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add relations to File table
ALTER TABLE "File" ADD CONSTRAINT "File_avatars_fkey" FOREIGN KEY ("id") REFERENCES "User"("avatarId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "File" ADD CONSTRAINT "File_siteLogos_fkey" FOREIGN KEY ("id") REFERENCES "SystemSettings"("siteLogoId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "File" ADD CONSTRAINT "File_heroBackgrounds_fkey" FOREIGN KEY ("id") REFERENCES "SystemSettings"("heroBackgroundId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "File" ADD CONSTRAINT "File_ticketAttachments_fkey" FOREIGN KEY ("id") REFERENCES "TicketAttachment"("fileId") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add relation to User table for uploadedFiles
ALTER TABLE "User" ADD CONSTRAINT "User_uploadedFiles_fkey" FOREIGN KEY ("id") REFERENCES "File"("uploadedById") ON DELETE CASCADE ON UPDATE CASCADE;
