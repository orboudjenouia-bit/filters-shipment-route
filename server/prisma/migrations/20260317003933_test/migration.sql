/*
  Warnings:

  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Roles" NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active';

-- CreateTable
CREATE TABLE "Subscription" (
    "sub_ID" SERIAL NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'Free-Tier',
    "rest_Time" TIMESTAMP(3) NOT NULL,
    "user_ID" INTEGER NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("sub_ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_user_ID_key" ON "Subscription"("user_ID");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_user_ID_fkey" FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
