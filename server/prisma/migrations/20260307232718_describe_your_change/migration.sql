/*
  Warnings:

  - The primary key for the `Route` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Date` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `Destination` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `More_Information` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `Origin` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `Route_ID` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `User_ID` on the `Route` table. All the data in the column will be lost.
  - The primary key for the `Shipment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Date` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `Destination` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `Origin` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `Priority` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `Shipment_ID` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `Size` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `Special_Information` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `User_ID` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `Weight` on the `Shipment` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ID` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Location` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Profile_Photo` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `Role` on the `User` table. All the data in the column will be lost.
  - The primary key for the `Vehicle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Capacity` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `Photo` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `Plate_Number` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `User_ID` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `Vehicle_Name` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[route_ID]` on the table `Route` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `more_Information` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_ID` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Shipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination` to the `Shipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin` to the `Shipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Shipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Shipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `special_Information` to the `Shipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_ID` to the `Shipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Shipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_Photo` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `working_Time` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacity` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photo` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plate_Number` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_ID` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_Name` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('BUSINESS', 'INDIVIDUAL');

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_Route_ID_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_Shipment_ID_fkey";

-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_User_ID_fkey";

-- DropForeignKey
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_User_ID_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_User_ID_fkey";

-- DropIndex
DROP INDEX "Route_Route_ID_key";

-- DropIndex
DROP INDEX "User_Email_key";

-- AlterTable
ALTER TABLE "Route" DROP CONSTRAINT "Route_pkey",
DROP COLUMN "Date",
DROP COLUMN "Destination",
DROP COLUMN "More_Information",
DROP COLUMN "Origin",
DROP COLUMN "Route_ID",
DROP COLUMN "User_ID",
ADD COLUMN     "date" VARCHAR(11) NOT NULL,
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "more_Information" TEXT NOT NULL,
ADD COLUMN     "origin" TEXT NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "route_ID" SERIAL NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "user_ID" INTEGER NOT NULL,
ADD CONSTRAINT "Route_pkey" PRIMARY KEY ("route_ID");

-- AlterTable
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_pkey",
DROP COLUMN "Date",
DROP COLUMN "Destination",
DROP COLUMN "Origin",
DROP COLUMN "Priority",
DROP COLUMN "Shipment_ID",
DROP COLUMN "Size",
DROP COLUMN "Special_Information",
DROP COLUMN "User_ID",
DROP COLUMN "Weight",
ADD COLUMN     "date" VARCHAR(11) NOT NULL,
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "origin" TEXT NOT NULL,
ADD COLUMN     "priority" TEXT NOT NULL,
ADD COLUMN     "shipment_ID" SERIAL NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "special_Information" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'In-Stock',
ADD COLUMN     "user_ID" INTEGER NOT NULL,
ADD COLUMN     "weight" INTEGER NOT NULL,
ADD CONSTRAINT "Shipment_pkey" PRIMARY KEY ("shipment_ID");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "Email",
DROP COLUMN "ID",
DROP COLUMN "Location",
DROP COLUMN "Password",
DROP COLUMN "Phone",
DROP COLUMN "Profile_Photo",
DROP COLUMN "Role",
ADD COLUMN     "email" VARCHAR(50) NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone" VARCHAR(10) NOT NULL,
ADD COLUMN     "profile_Photo" TEXT NOT NULL,
ADD COLUMN     "type" "UserType" NOT NULL,
ADD COLUMN     "working_Time" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_pkey",
DROP COLUMN "Capacity",
DROP COLUMN "Photo",
DROP COLUMN "Plate_Number",
DROP COLUMN "User_ID",
DROP COLUMN "Vehicle_Name",
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "photo" TEXT NOT NULL,
ADD COLUMN     "plate_Number" INTEGER NOT NULL,
ADD COLUMN     "user_ID" INTEGER NOT NULL,
ADD COLUMN     "vehicle_Name" TEXT NOT NULL,
ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("plate_Number");

-- DropTable
DROP TABLE "Match";

-- CreateTable
CREATE TABLE "Individual" (
    "user_ID" INTEGER NOT NULL,
    "full_Name" TEXT NOT NULL,
    "nin" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "Individual_pkey" PRIMARY KEY ("user_ID")
);

-- CreateTable
CREATE TABLE "Business" (
    "user_ID" INTEGER NOT NULL,
    "business_Name" TEXT NOT NULL,
    "rc_Number" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "nif" INTEGER NOT NULL,
    "nis" INTEGER NOT NULL,
    "locations" TEXT[],

    CONSTRAINT "Business_pkey" PRIMARY KEY ("user_ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Individual_nin_key" ON "Individual"("nin");

-- CreateIndex
CREATE UNIQUE INDEX "Business_rc_Number_key" ON "Business"("rc_Number");

-- CreateIndex
CREATE UNIQUE INDEX "Route_route_ID_key" ON "Route"("route_ID");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_user_ID_fkey" FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_user_ID_fkey" FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_user_ID_fkey" FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_user_ID_fkey" FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_user_ID_fkey" FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
