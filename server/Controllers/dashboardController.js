const { StatusCodes } = require('http-status-codes');
const prisma = require('../config/prismaClient');
const AppError = require('../utils/AppError');

const getStats = async (req, res, next) => {
    const id = Number(req.user?.id);

    const [
        allShipments,
        activeShipments,
        allRoutes,
        activeRoutes,
        allVehicles,
    ] = await Promise.all([
        prisma.shipment.count({
            where: { user_ID: id },
        }),
        prisma.shipment.count({
            where: {
                user_ID: id,
                status: { in: ['In-Stock', 'In-Delivery'] },
            },
        }),
        prisma.route.count({
            where: { user_ID: id },
        }),
        prisma.route.count({
            where: {
                user_ID: id,
                status: 'Active',
            },
        }),
        prisma.vehicle.count({
            where: { user_ID: id },
        }),
    ]);

    res.status(StatusCodes.OK).json({
        allShipments,
        activeShipments,
        allRoutes,
        activeRoutes,
        allVehicles,
    });
};

module.exports = { getStats };
