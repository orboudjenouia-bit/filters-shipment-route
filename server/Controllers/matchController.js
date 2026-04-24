const prisma = require('../config/prismaClient');
const AppError = require('../utils/AppError');
const { StatusCodes } = require('http-status-codes');

function orderedInclusion (shipmentCoordinates, routesWaypoints) {

    let i = 0;
    let j = 0;

    while (i < shipmentCoordinates.length && j < routesWaypoints.length) {
        if (shipmentCoordinates[i] === routesWaypoints[j]) {
            i++;
        }
        j++;
    }
    return i === shipmentCoordinates.length
}

const suggestRoutes = async (req,res,next) => {

    const { origin, destination } = req.body

    const shipmentsCoordinates = [origin,destination]

    const candidates = await prisma.route.findMany({
        where:{
            waypoints:{
                hasEvery: shipmentsCoordinates
            }
        }
    })

    const suggestedRoutes = candidates.filter(route => orderedInclusion(shipmentsCoordinates, route.waypoints))

    const availableTrucks = await prisma.user.findMany({
        where: {
            vehicles: {
                some: {
                    status: "Available"
                }
            }
        },
        include: {
            vehicles: {
                where: {
                    status: "Available"
                }
            }
        }
    })
    const counter = suggestedRoutes.length + availableTrucks.length
    res.status(StatusCodes.OK).json(availableTrucks, suggestedRoutes, counter)
}

const suggestShipments = async (req,res,next) => {

    const waypoints = req.body.waypoints

    const suggestions = await prisma.shipment.findMany({
        where: {
            origin: { in: waypoints}
        }
    })

    const counter = suggestions.length
    res.status(StatusCodes.OK).json(suggestions, counter)

}


module.exports = {suggestRoutes, suggestShipments}