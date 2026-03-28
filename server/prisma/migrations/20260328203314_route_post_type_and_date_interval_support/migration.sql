-- CreateEnum
CREATE TYPE "RoutePostType" AS ENUM ('ORIGIN_DESTINATION', 'REGION');

-- CreateEnum
CREATE TYPE "RouteDateType" AS ENUM ('DAY', 'INTERVAL');

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "date_type" "RouteDateType" NOT NULL DEFAULT 'DAY',
ADD COLUMN     "interval_end" VARCHAR(10),
ADD COLUMN     "interval_start" VARCHAR(10),
ADD COLUMN     "post_type" "RoutePostType" NOT NULL DEFAULT 'ORIGIN_DESTINATION',
ALTER COLUMN "date" SET DATA TYPE VARCHAR(30);
