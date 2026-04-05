const prisma = require('../config/prismaClient');
const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { StatusCodes } = require('http-status-codes');
const createNotifs = require('../utils/createNotifs');

const listRoutes = async (req, res, next) => {
    const routes = await prisma.route.findMany({
        include: {
            vehicle: {
                select: {
                    plate_Number: true,
                    vehicle_Name: true,
                    type: true,
                    color: true,
                    year: true,
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
    });
    const total = await prisma.route.count();
    res.status(StatusCodes.OK).json({
        success: true,
        routes,
        total,
    });
    
};

const listMyRoutes = async (req, res, next) => {
    const routes = await prisma.route.findMany({
        where: { user_ID: req.user.id },
        include: {
            vehicle: {
                select: {
                    plate_Number: true,
                    vehicle_Name: true,
                    type: true,
                    color: true,
                    year: true,
                    capacity: true,
                },
            },
        },
        orderBy: { route_ID: 'desc' },
    });

    res.status(StatusCodes.OK).json({
        success: true,
        routes,
        total: routes.length,
    });
};

const postRoute = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation Failed', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
    }

    const route = {
        user_ID: req.user.id,
        ...req.body,
    };

    const add = await prisma.route.create({ data: route });

    await createNotifs(
        req.user.id,
        'Route Created',
        `Route ${add.route_ID} Created Successfully`,
        'routes',
        'route',
        add.route_ID
    )

    res.status(StatusCodes.CREATED).json({
        msg: 'Route Posted Successfully',
        data: add,
    });
};

const editRoute = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation Failed', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
    }

    const { route_ID, ...fields } = req.body;
    const routeId = parseInt(route_ID);

    const route = await prisma.route.findUnique({
        where: { route_ID: routeId },
    });

    if (!route || route.user_ID != req.user.id) {
        throw new AppError('Not authorized to update this route', StatusCodes.FORBIDDEN, 'FORBIDDEN');
    }

    const updateRoute = await prisma.route.update({
        where: { route_ID: routeId },
        data: fields,
    });

    await createNotifs(
        req.user.id,
        'Route Updated',
        `Route ${routeId} Updated Successfully`,
        'routes',
        'route',
        routeId
    )

    res.status(StatusCodes.OK).json({
        msg: 'Route Updated Successfully',
        data: updateRoute,
    });
};

const deleteRoute = async (req, res, next) => {
    const id = parseInt(req.params.id);
    
    const route = await prisma.route.findUnique({
        where: { route_ID: id },
    });

    if (!route || route.user_ID != req.user.id) {
        throw new AppError('Not authorized to delete this route', StatusCodes.FORBIDDEN, 'FORBIDDEN');
    }

    const deletedRoute = await prisma.route.delete({
        where: { route_ID: id },
    });

    await createNotifs(
        req.user.id,
        'Route Deleted',
        `Route ${id} Deleted Successfully`,
        'routes',
        'route',
        id
    )

    res.status(StatusCodes.OK).json({ msg: 'Route Deleted Successfully' });
};

module.exports = { listRoutes, listMyRoutes, postRoute, editRoute, deleteRoute };
