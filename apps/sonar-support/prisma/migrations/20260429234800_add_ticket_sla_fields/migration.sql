-- Add SLA tracking fields to tickets
ALTER TABLE "Ticket" ADD COLUMN "slaTargetAt" TIMESTAMP(3);
ALTER TABLE "Ticket" ADD COLUMN "slaBreachedAt" TIMESTAMP(3);

-- Backfill SLA targets for existing tickets using the current priority policy:
-- LOW=72h, NORMAL=24h, HIGH=8h, URGENT=2h.
UPDATE "Ticket"
SET "slaTargetAt" = CASE "priority"
    WHEN 'LOW' THEN "createdAt" + INTERVAL '72 hours'
    WHEN 'HIGH' THEN "createdAt" + INTERVAL '8 hours'
    WHEN 'URGENT' THEN "createdAt" + INTERVAL '2 hours'
    ELSE "createdAt" + INTERVAL '24 hours'
END
WHERE "slaTargetAt" IS NULL;

-- Mark already-breached tickets based on completion time when available,
-- otherwise based on the current time for active tickets.
UPDATE "Ticket"
SET "slaBreachedAt" = CASE
    WHEN "closedAt" IS NOT NULL AND "closedAt" > "slaTargetAt" THEN "slaTargetAt"
    WHEN "resolvedAt" IS NOT NULL AND "resolvedAt" > "slaTargetAt" THEN "slaTargetAt"
    WHEN "status" NOT IN ('RESOLVED', 'CLOSED') AND CURRENT_TIMESTAMP > "slaTargetAt" THEN "slaTargetAt"
    ELSE "slaBreachedAt"
END
WHERE "slaTargetAt" IS NOT NULL
  AND "slaBreachedAt" IS NULL
  AND (
    ("closedAt" IS NOT NULL AND "closedAt" > "slaTargetAt")
    OR ("resolvedAt" IS NOT NULL AND "resolvedAt" > "slaTargetAt")
    OR ("status" NOT IN ('RESOLVED', 'CLOSED') AND CURRENT_TIMESTAMP > "slaTargetAt")
  );

CREATE INDEX "Ticket_slaTargetAt_idx" ON "Ticket"("slaTargetAt");
CREATE INDEX "Ticket_slaBreachedAt_idx" ON "Ticket"("slaBreachedAt");
