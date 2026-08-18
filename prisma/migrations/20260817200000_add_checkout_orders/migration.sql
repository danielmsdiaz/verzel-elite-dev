CREATE TYPE "CheckoutOrderStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'FULFILLED',
  'REFUNDED',
  'EXPIRED'
);

CREATE TABLE "CheckoutOrder" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "status" "CheckoutOrderStatus" NOT NULL DEFAULT 'PENDING',
  "seatIds" TEXT[],
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'brl',
  "stripeCheckoutSessionId" TEXT,
  "stripePaymentIntentId" TEXT,
  "fulfilledAt" TIMESTAMP(3),
  "refundedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CheckoutOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CheckoutOrder_stripeCheckoutSessionId_key"
ON "CheckoutOrder"("stripeCheckoutSessionId");

CREATE INDEX "CheckoutOrder_userId_createdAt_idx"
ON "CheckoutOrder"("userId", "createdAt");

CREATE INDEX "CheckoutOrder_eventId_status_idx"
ON "CheckoutOrder"("eventId", "status");

ALTER TABLE "CheckoutOrder"
ADD CONSTRAINT "CheckoutOrder_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CheckoutOrder"
ADD CONSTRAINT "CheckoutOrder_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "Event"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
