/*
  Warnings:

  - The `date_type` column on the `Route` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `post_type` column on the `Route` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('ORIGIN_DESTINATION', 'REGION');

-- CreateEnum
CREATE TYPE "DateType" AS ENUM ('DAY', 'INTERVAL');

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "date_type",
ADD COLUMN     "date_type" "DateType" NOT NULL DEFAULT 'DAY',
DROP COLUMN "post_type",
ADD COLUMN     "post_type" "PostType" NOT NULL DEFAULT 'ORIGIN_DESTINATION';

-- DropEnum
DROP TYPE "RouteDateType";

-- DropEnum
DROP TYPE "RoutePostType";
