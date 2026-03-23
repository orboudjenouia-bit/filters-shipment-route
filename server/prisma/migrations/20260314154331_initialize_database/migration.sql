/*
  Warnings:

  - You are about to drop the column `user_ID` on the `Route` table. All the data in the column will be lost.
  - Added the required column `vehicle_plate` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_user_ID_fkey";

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "user_ID",
ADD COLUMN     "vehicle_plate" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_vehicle_plate_fkey" FOREIGN KEY ("vehicle_plate") REFERENCES "Vehicle"("plate_Number") ON DELETE RESTRICT ON UPDATE CASCADE;
