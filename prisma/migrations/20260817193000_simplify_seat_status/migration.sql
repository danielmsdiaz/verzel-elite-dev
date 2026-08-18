-- Collapse every unavailable state into a single permanent reservation state.
ALTER TYPE "SeatStatus" RENAME TO "SeatStatus_old";

CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'RESERVED');

ALTER TABLE "EventSeat"
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "SeatStatus"
USING (
  CASE
    WHEN "status"::text = 'AVAILABLE' THEN 'AVAILABLE'::"SeatStatus"
    ELSE 'RESERVED'::"SeatStatus"
  END
),
ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';

DROP TYPE "SeatStatus_old";
