/*
  Warnings:

  - You are about to alter the column `verificationToken` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - Made the column `verificationToken` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "verificationToken" SET NOT NULL,
ALTER COLUMN "verificationToken" SET DATA TYPE VARCHAR(10);
