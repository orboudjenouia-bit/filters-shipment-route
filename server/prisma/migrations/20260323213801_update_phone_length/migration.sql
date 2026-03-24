/*
  Warnings:

  - Added the required column `user_ID` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "user_ID" INTEGER NOT NULL,
ALTER COLUMN "more_Information" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "deleted_at" TIMESTAMP(3);
