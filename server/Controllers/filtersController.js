const { StatusCodes } = require('http-status-codes');
const prisma = require('../config/prismaClient');
const AppError = require('../utils/AppError');

const filterShipments = async (req,res,next) => {
    const {status, productTypes, possibleVehicles,
        origins, destinations, minPrice, maxPrice, beforeDate, afterDate, sortBy, sortOrder } = req.query

    const where = {}

    if (status) where.status = status
    if (productTypes) where.productTypes = { in: productTypes }
    if (possibleVehicles) where.possibleVehicles = { in: possibleVehicles }
    if (origins) where.origin = { in: origins }
    if (destinations) where.destination = { in: destinations }
    
    if (minPrice || maxPrice) where.price = {
        ...(minPrice && { gte: Number(minPrice) }),
        ...(maxPrice && { lte: Number(maxPrice) }),
    }
    
    if (beforeDate || afterDate) where.createdAt = {
        ...(afterDate  && { gte: new Date(afterDate) }),
        ...(beforeDate && { lte: new Date(beforeDate) }),
    }
    
    const orderBy = sortBy ? {[sortBy]: sortOrder || 'asc'} : {createdAt: 'desc'}

    const filteredShipments = await prisma.shipment.findMany({where, orderBy})

    res.status(StatusCodes.OK).json(filteredShipments)
    
}

const filterRoutes = async (req,res,next) => {
    const {status, vehicleType,
        origins, destinations, waypoints, region, beforeDate, afterDate, sortBy, sortOrder } = req.query

    const where = {}

    if (status) where.status = status
    if (vehicleType) where.vehicleType = vehicleType
    if (region) where.region = region

    if (waypoints)   where.waypoints = { in: waypoints }
    if (origins)     where.origin = { in: origins }
    if (destinations)where.destination = { in: destinations }

    if (beforeDate || afterDate) where.createdAt = {
        ...(afterDate  && { gte: new Date(afterDate) }),
        ...(beforeDate && { lte: new Date(beforeDate) }),
    }
    
    const orderBy = sortBy ? {[sortBy]: sortOrder || 'asc'} : {createdAt: 'desc'}

    const filteredRoutes = await prisma.route.findMany({where, orderBy})

    res.status(StatusCodes.OK).json(filteredRoutes)
}


module.exports = { filterShipments, filterRoutes }