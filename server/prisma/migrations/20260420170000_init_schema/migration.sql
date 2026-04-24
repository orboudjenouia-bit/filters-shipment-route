-- Baseline schema for a clean migration history.
-- Later migrations in this repository assume these tables already exist.

CREATE TYPE "UserType" AS ENUM ('BUSINESS', 'INDIVIDUAL');
CREATE TYPE "Roles" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "PostType" AS ENUM ('ORIGIN_DESTINATION', 'REGION');
CREATE TYPE "DateType" AS ENUM ('DAY', 'INTERVAL');

CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" TEXT NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "profile_Photo" TEXT,
    "working_Time" TEXT,
    "type" "UserType" NOT NULL,
    "role" "Roles" NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "verificationToken" VARCHAR(10),
    "verificationTokenExpires" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Individual" (
    "user_ID" INTEGER NOT NULL,
    "full_Name" TEXT NOT NULL,
    "nin" VARCHAR(18) NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "Individual_pkey" PRIMARY KEY ("user_ID")
);

CREATE UNIQUE INDEX "Individual_nin_key" ON "Individual"("nin");

CREATE TABLE "Business" (
    "user_ID" INTEGER NOT NULL,
    "business_Name" TEXT NOT NULL,
    "rc_Number" VARCHAR(12) NOT NULL,
    "form" TEXT NOT NULL,
    "nif" VARCHAR(15) NOT NULL,
    "nis" VARCHAR(15) NOT NULL,
    "locations" TEXT[] NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("user_ID")
);

CREATE UNIQUE INDEX "Business_rc_Number_key" ON "Business"("rc_Number");

CREATE TABLE "Vehicle" (
    "plate_Number" VARCHAR(12) NOT NULL,
    "vehicle_Name" TEXT NOT NULL,
    "type" TEXT,
    "color" TEXT,
    "year" INTEGER,
    "capacity" DOUBLE PRECISION NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "photo" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_ID" INTEGER NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("plate_Number")
);

CREATE TABLE "Route" (
    "route_ID" SERIAL NOT NULL,
    "name" TEXT,
    "photo" TEXT,
    "origin" TEXT,
    "destination" TEXT,
    "waypoints" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "region" TEXT,
    "date" VARCHAR(30),
    "post_type" "PostType" NOT NULL DEFAULT 'ORIGIN_DESTINATION',
    "date_type" "DateType" NOT NULL DEFAULT 'DAY',
    "interval_start" VARCHAR(10),
    "interval_end" VARCHAR(10),
    "more_Information" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_ID" INTEGER NOT NULL,
    "vehicle_plate" VARCHAR(12) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("route_ID")
);

CREATE UNIQUE INDEX "Route_route_ID_key" ON "Route"("route_ID");

CREATE TABLE "Shipment" (
    "shipment_ID" SERIAL NOT NULL,
    "title" TEXT,
    "product_Type" TEXT,
    "possible_Veh" TEXT,
    "photo" TEXT,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" VARCHAR(11) NOT NULL,
    "time" VARCHAR(5),
    "priority" TEXT NOT NULL DEFAULT 'Normal',
    "special_Information" TEXT,
    "status" TEXT NOT NULL DEFAULT 'In-Stock',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_ID" INTEGER NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("shipment_ID")
);

CREATE TABLE "Subscription" (
    "sub_ID" SERIAL NOT NULL,
    "tier" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) DEFAULT (CURRENT_TIMESTAMP + interval '1 month'),
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "user_ID" INTEGER NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("sub_ID")
);

CREATE UNIQUE INDEX "Subscription_user_ID_key" ON "Subscription"("user_ID");

CREATE TABLE "Notification" (
    "notif_ID" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "entityType" TEXT NOT NULL,
    "entityID" INTEGER NOT NULL,
    "user_ID" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notif_ID")
);

CREATE TABLE "NotificationSettings" (
    "id" SERIAL NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "shipmentUpdates" BOOLEAN NOT NULL DEFAULT TRUE,
    "routeUpdates" BOOLEAN NOT NULL DEFAULT TRUE,
    "Reminders" BOOLEAN NOT NULL DEFAULT TRUE,
    "user_ID" INTEGER NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationSettings_user_ID_key" ON "NotificationSettings"("user_ID");

ALTER TABLE "Individual"
ADD CONSTRAINT "Individual_user_ID_fkey"
FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Business"
ADD CONSTRAINT "Business_user_ID_fkey"
FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Vehicle"
ADD CONSTRAINT "Vehicle_user_ID_fkey"
FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Route"
ADD CONSTRAINT "Route_user_ID_fkey"
FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Route"
ADD CONSTRAINT "Route_vehicle_plate_fkey"
FOREIGN KEY ("vehicle_plate") REFERENCES "Vehicle"("plate_Number") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Shipment"
ADD CONSTRAINT "Shipment_user_ID_fkey"
FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Subscription"
ADD CONSTRAINT "Subscription_user_ID_fkey"
FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_user_ID_fkey"
FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "NotificationSettings"
ADD CONSTRAINT "NotificationSettings_user_ID_fkey"
FOREIGN KEY ("user_ID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;