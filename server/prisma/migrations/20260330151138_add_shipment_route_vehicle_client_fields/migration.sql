/*
  Warnings:

  - You are about to alter the column `verificationToken` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.

*/
-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "name" TEXT,
ADD COLUMN     "photo" TEXT;

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "category" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "time" VARCHAR(5),
ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "verificationToken" SET DATA TYPE VARCHAR(10);

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "color" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "year" INTEGER;
