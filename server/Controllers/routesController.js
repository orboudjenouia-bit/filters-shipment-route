const prisma = require("../config/prismaClient")
const { validationResult } = require('express-validator')
const AppError = require("../utils/AppError")
const { StatusCodes } = require("http-status-codes");


const listRoutes = async (req,res,next) => {
    
    const routes = await prisma.route.findMany({
        include: {
            vehicle: {
                select: {
                    plate_Number: true,
                    vehicle_Name: true,
                    capacity: true,
                },
            },
            user: {
                select: {
                    individual: {
                        select: {
                            full_Name: true,
                        },
                    },
                    business: {
                        select: {
                            business_Name: true,
                        },
                    },
                },
            },
        },
    })
    if (!routes) {
        throw new AppError("No Routes Created", StatusCodes.NOT_FOUND, "No_ROUTES")
    }
    const total = await prisma.route.count()
    res.status(StatusCodes.OK).json({routes, total})
    
}

const postRoute = async (req,res,next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        throw new AppError("Validation Failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR")
    }
    
    const route = {
        user_ID: req.user.id,
        ...req.body
    }

    const add = await prisma.route.create({ data: route })
    res.status(StatusCodes.CREATED).json({ msg: "Route Posted Successfully", data: add })
}

const editRoute = async (req,res,next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        throw new AppError("Validation Failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR")
    }
    
    const { route_ID, ...fields } = req.body
    const routeId = parseInt(route_ID)

    const route = await prisma.route.findUnique({
        where: { route_ID: routeId }
    })

    if (!route || route.user_ID != req.user.id) {
        throw new AppError("Not authorized to update this route", StatusCodes.FORBIDDEN, "FORBIDDEN")
    }

    const updateRoute = await prisma.route.update({
        where: { route_ID: routeId },
        data: fields
    })
    res.status(StatusCodes.OK).json({ msg: "Route Updated Successfully", data: updateRoute })
}

const deleteRoute = async (req,res,next) => {
    const { id } = req.params

    const route = await prisma.route.findUnique({
        where: { route_ID: parseInt(id) }
    })

    if (!route || route.user_ID != req.user.id) {
        throw new AppError("Not authorized to delete this route", StatusCodes.FORBIDDEN, "FORBIDDEN")
    }

    const deletedRoute = await prisma.route.delete({
        where: { route_ID: parseInt(id) }
    })
    res.status(StatusCodes.OK).json({msg: "Route Deleted Successfully"})
}

module.exports = { listRoutes, postRoute, editRoute, deleteRoute }
