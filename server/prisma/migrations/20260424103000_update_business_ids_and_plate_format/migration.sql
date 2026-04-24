/*
  Notes:
  - This migration changes identifier fields to string-based formats.
  - Existing numeric values are cast to text.
*/

-- Drop FK before changing referenced/referencing column types
ALTER TABLE "Route" DROP CONSTRAINT "Route_vehicle_plate_fkey";

-- Tighten ID storage types
ALTER TABLE "Individual"
ALTER COLUMN "nin" TYPE VARCHAR(18);

ALTER TABLE "Business"
ALTER COLUMN "rc_Number" TYPE VARCHAR(12),
ALTER COLUMN "nif" TYPE VARCHAR(15) USING "nif"::text,
ALTER COLUMN "nis" TYPE VARCHAR(15) USING "nis"::text;

-- Convert plate columns to string to preserve 5-3-2 formatting and leading zeros
ALTER TABLE "Vehicle"
ALTER COLUMN "plate_Number" TYPE VARCHAR(12) USING "plate_Number"::text;

ALTER TABLE "Route"
ALTER COLUMN "vehicle_plate" TYPE VARCHAR(12) USING "vehicle_plate"::text;

-- Recreate FK
ALTER TABLE "Route"
ADD CONSTRAINT "Route_vehicle_plate_fkey"
FOREIGN KEY ("vehicle_plate") REFERENCES "Vehicle"("plate_Number")
ON DELETE RESTRICT ON UPDATE CASCADE;
