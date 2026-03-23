-- CreateTable
CREATE TABLE "User" (
    "ID" SERIAL NOT NULL,
    "Phone" VARCHAR(10) NOT NULL,
    "Location" TEXT NOT NULL,
    "Role" VARCHAR(10) NOT NULL,
    "Profile_Photo" TEXT NOT NULL,
    "Email" VARCHAR(50) NOT NULL,
    "Password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "Plate_Number" INTEGER NOT NULL,
    "Vehicle_Name" TEXT NOT NULL,
    "Capacity" INTEGER NOT NULL,
    "Photo" TEXT NOT NULL,
    "User_ID" INTEGER NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("Plate_Number")
);

-- CreateTable
CREATE TABLE "Route" (
    "Route_ID" SERIAL NOT NULL,
    "Origin" TEXT NOT NULL,
    "Destination" TEXT NOT NULL,
    "Date" VARCHAR(11) NOT NULL,
    "More_Information" TEXT NOT NULL,
    "User_ID" INTEGER NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("Route_ID")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "Shipment_ID" SERIAL NOT NULL,
    "Origin" TEXT NOT NULL,
    "Destination" TEXT NOT NULL,
    "Size" INTEGER NOT NULL,
    "Weight" INTEGER NOT NULL,
    "Date" VARCHAR(11) NOT NULL,
    "Priority" TEXT NOT NULL,
    "Special_Information" TEXT NOT NULL,
    "User_ID" INTEGER NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("Shipment_ID")
);

-- CreateTable
CREATE TABLE "Match" (
    "Match_ID" SERIAL NOT NULL,
    "Route_ID" INTEGER NOT NULL,
    "Shipment_ID" INTEGER NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("Match_ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Route_Route_ID_key" ON "Route"("Route_ID");

-- CreateIndex
CREATE UNIQUE INDEX "Match_Shipment_ID_key" ON "Match"("Shipment_ID");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_Route_ID_fkey" FOREIGN KEY ("Route_ID") REFERENCES "Route"("Route_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_Shipment_ID_fkey" FOREIGN KEY ("Shipment_ID") REFERENCES "Shipment"("Shipment_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
