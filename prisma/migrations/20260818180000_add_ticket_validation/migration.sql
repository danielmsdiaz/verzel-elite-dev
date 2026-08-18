ALTER TABLE "Ticket"
ADD COLUMN "checkedInById" TEXT;

CREATE INDEX "Ticket_checkedInById_checkedInAt_idx"
ON "Ticket"("checkedInById", "checkedInAt");

ALTER TABLE "Ticket"
ADD CONSTRAINT "Ticket_checkedInById_fkey"
FOREIGN KEY ("checkedInById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
