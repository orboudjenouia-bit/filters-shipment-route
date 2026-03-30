/*
  Warnings:

  - Added the required column `user_ID` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "user_ID" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Active';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verificationTokenExpires" TIMESTAMP(3);
