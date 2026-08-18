CREATE TYPE "TicketStatus" AS ENUM ('VALID', 'USED', 'CANCELLED');

CREATE TABLE "Ticket" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "shareToken" TEXT NOT NULL,
  "status" "TicketStatus" NOT NULL DEFAULT 'VALID',
  "orderId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "seatId" TEXT NOT NULL,
  "checkedInAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Ticket_code_key" ON "Ticket"("code");
CREATE UNIQUE INDEX "Ticket_shareToken_key" ON "Ticket"("shareToken");
CREATE UNIQUE INDEX "Ticket_orderId_seatId_key" ON "Ticket"("orderId", "seatId");
CREATE INDEX "Ticket_eventId_status_idx" ON "Ticket"("eventId", "status");

ALTER TABLE "Ticket"
ADD CONSTRAINT "Ticket_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "CheckoutOrder"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket"
ADD CONSTRAINT "Ticket_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "Event"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket"
ADD CONSTRAINT "Ticket_seatId_fkey"
FOREIGN KEY ("seatId") REFERENCES "EventSeat"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Preserve already fulfilled purchases by issuing one ticket per paid seat.
INSERT INTO "Ticket" (
  "id",
  "code",
  "shareToken",
  "status",
  "orderId",
  "eventId",
  "seatId",
  "createdAt",
  "updatedAt"
)
SELECT
  'tkt_' || SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 24),
  UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12)),
  gen_random_uuid()::text,
  'VALID'::"TicketStatus",
  orders."id",
  orders."eventId",
  seat_ids."seatId",
  COALESCE(orders."fulfilledAt", CURRENT_TIMESTAMP),
  CURRENT_TIMESTAMP
FROM "CheckoutOrder" AS orders
CROSS JOIN LATERAL UNNEST(orders."seatIds") AS seat_ids("seatId")
WHERE orders."status" = 'FULFILLED';
