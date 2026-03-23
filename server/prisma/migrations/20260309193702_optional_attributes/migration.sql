/*
  Warnings:

  - You are about to drop the column `size` on the `Shipment` table. All the data in the column will be lost.
  - Added the required column `volume` to the `Shipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Route" ALTER COLUMN "status" SET DEFAULT 'In-Stock';

-- AlterTable
ALTER TABLE "Shipment" DROP COLUMN "size",
ADD COLUMN     "volume" INTEGER NOT NULL,
ALTER COLUMN "priority" SET DEFAULT 'Normal',
ALTER COLUMN "special_Information" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profile_Photo" DROP NOT NULL,
ALTER COLUMN "working_Time" DROP NOT NULL;
