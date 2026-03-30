const { StatusCodes } = require("http-status-codes");
const prisma = require("../config/prismaClient");
const AppError = require("../utils/AppError");
const { validationResult } = require("express-validator");



/*   HISTORY  */
const getShipmentHistory = async (req, res, next) => {
  const userId = req.user.id;

  const shipments = await prisma.shipment.findMany({
    where: { user_ID: userId },
    orderBy: {
      shipment_ID: "desc",
    },
  });

  const total = await prisma.shipment.count({
    where: { user_ID: userId },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    msg: "Shipment history retrieved successfully",
    total,
    shipments
  });
};

const getRouteHistory = async (req, res, next) => {
  const userId = req.user.id;

  const routes = await prisma.route.findMany({
    where: {
      vehicle: {
        user_ID: userId,
        deleted_at: null,
      },
    },
    include: {
      vehicle: {
        select: {
          vehicle_Name: true,
          plate_Number: true,
        },
      },
    },
    orderBy: {
      route_ID: "desc",
    },
  });

  const total = await prisma.route.count({
    where: {
      vehicle: {
        user_ID: userId,
        deleted_at: null,
      },
    },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    msg: "Route history retrieved successfully",
    total,
    routes,
  });
};


/*   Vehicles  CRUD */

const listVehicles = async (req, res, next) => {
  const userId = req.user.id;

  const vehicles = await prisma.vehicle.findMany({
    where: {
      user_ID: userId,
      deleted_at: null
    },
    include: {
      routes: true
    },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    msg: "Vehicles retrieved successfully",
    count: vehicles.length,
    vehicles,
  });
};

const createVehicle = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR");
  }

  const userId = req.user.id;
  const { plate_Number, vehicle_Name, capacity, photo } = req.body;

  const existingVehicle = await prisma.vehicle.findUnique({
    where: { plate_Number },
  });

  if (existingVehicle) {
    throw new AppError("Vehicle with this plate number already exists", StatusCodes.CONFLICT, "VEHICLE_EXISTS");
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      plate_Number,
      vehicle_Name,
      capacity,
      photo: photo || "",
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    msg: "Vehicle created successfully",
    vehicle
  });
};

const updateVehicle = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR");
  }

  const userId = req.user.id;
  const { plate_Number, ...fields } = req.body;

  const vehicle = await prisma.vehicle.findUnique({
    where: { plate_Number: plate_Number },
  });

  if (!vehicle || vehicle.user_ID !== userId) {
    throw new AppError("You don't have permission to update this vehicle", StatusCodes.FORBIDDEN, "ACTION_FORBIDDEN");
  }

  if (vehicle.deleted_at !== null) {
    throw new AppError("Cannot update a deleted vehicle", StatusCodes.BAD_REQUEST, "VEHICLE_DELETED");
  }


  const updatedVehicle = await prisma.vehicle.update({
    where: { plate_Number: plate_Number },
    data: fields,
  });

  res.status(StatusCodes.OK).json({
    success: true,
    msg: "Vehicle updated successfully",
    vehicle: updatedVehicle,
  });
};

const deleteVehicle = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR");
  }

  
  const userId = req.user.id;
  const { plate_Number } = req.body;

  if (!plate_Number) {
    throw new AppError("Plate number is required", StatusCodes.BAD_REQUEST, "MISSING_FIELD");
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { plate_Number: plate_Number },
  });

  if (!vehicle || vehicle.user_ID !== userId) {
    throw new AppError(
      "You don't have permission to delete this vehicle",
      StatusCodes.FORBIDDEN,
      "FORBIDDEN"
    );
  }

  if (vehicle.deleted_at !== null) {
    throw new AppError(
      "Vehicle is already deleted",
      StatusCodes.BAD_REQUEST,
      "VEHICLE_ALREADY_DELETED"
    );
  }

  const deletedVehicle = await prisma.vehicle.update({
    where: { plate_Number: plate_Number },
    data: {
      deleted_at: new Date(),
    },
  });

  res.status(StatusCodes.OK).json({
    success: true,
    msg: "Vehicle deleted successfully (soft delete)",
    vehicle: deletedVehicle,
  });
};

/*  USER */

const getMyProfile = async (req, res, next) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      type: true,
      role: true,
      individual: {
        select: {
          full_Name: true,
          location: true,
        },
      },
      business: {
        select: {
          business_Name: true,
          locations: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", StatusCodes.NOT_FOUND, "USER_NOT_FOUND");
  }

  const displayName =
    user?.individual?.full_Name ||
    user?.business?.business_Name

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      ...user,
      displayName,
    },
  });
};


module.exports = {
  getShipmentHistory,
  getRouteHistory,
  listVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getMyProfile
};