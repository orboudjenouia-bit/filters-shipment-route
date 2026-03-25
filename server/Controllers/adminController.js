const prisma = require("../config/prismaClient")
const AppError = require("../utils/AppError")
const { StatusCodes } = require("http-status-codes");
const { Parser } = require("json2csv");
/* User Management */

const listUsers = async (req,res,next) => {

    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            phone: true,
            type: true, 
            role: true,
            individual: {
                select: {
                    full_Name: true
                }
            },
            business: {
                select: {
                    business_Name: true
                }
            }
        }
    })
    if (!users || users.length === 0) {
        throw new AppError("No Users Registered", StatusCodes.NOT_FOUND, "NO_USERS")
    }
    const total = await prisma.user.count()
    res.status(StatusCodes.OK).json({users, total})

}

const getUser = async (req,res,next) => {

    const id = parseInt(req.params.id)
    const user = await prisma.user.findUnique({
        where: { id: id}
    })

    if (!user) {
        throw new AppError("User Not Found", StatusCodes.NOT_FOUND, "User_NOT_FOUND")
    }
    res.status(StatusCodes.OK).json(user)

}


const activateUser = async (req,res,next) => {

    const id = parseInt(req.params.id)
    const user = await prisma.user.findUnique({
        where: { id: id }
    })
    if (!user) {
        throw new AppError("User Not Found", StatusCodes.NOT_FOUND, "User_NOT_FOUND")
    }

    const activate = await prisma.user.update({
        where: {id: id},
        data: {
            status: "Active"
        }
    })

    res.status(StatusCodes.OK).json({msg: `User ${id} is Active now`,activate})
    

}

const suspendUser = async (req,res,next) => {

    const id = parseInt(req.params.id)
    const user = await prisma.user.findUnique({
        where: { id: id }
    })
    if (!user) {
        throw new AppError("User Not Found", StatusCodes.NOT_FOUND, "User_NOT_FOUND")
    }

    const suspend = await prisma.user.update({
        where: {id: id},
        data: {
            status: "Suspended"
        }
    })

    res.status(StatusCodes.OK).json({msg: `User ${id} is Suspended now`, suspend})

}

/*
    --> For Routes and Shipments management, we will use their specific controllers/routes
*/

// Dashboard

const getDashboardStats = async (req,res,next) => {
    const [
        totalUsers, activeUsers, suspendedUsers, totalVehicles,
        totalShipments, totalRoutes ,activeShipments,
        activeRoutes
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "Active" }}),
        prisma.user.count({ where: { status: "Suspended" }}),
        prisma.vehicle.count(),
        prisma.shipment.count(),
        prisma.route.count(),
        prisma.shipment.count({ where : { status: "In-stock" }}),
        prisma.route.count({ where : { status: "In-stock" }}),
    ])
    res.status(StatusCodes.OK).json({
        activeShipments,
        activeRoutes,
        users: {
            total: totalUsers,
            active: activeUsers,
            suspended: suspendedUsers
        },
        shipments: {
            total: totalShipments
        },
        routes: {
            total: totalRoutes
        },
        vehicles: {
            total: totalVehicles
        }
    });
}


const exportUsersCSV = async (req,res,next) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            phone: true,
            type: true,
            role: true,
            status: true,
            individual: {
                select: {
                    full_Name: true
                }
            },
            business: {
                select: {
                    business_Name: true
                }
            }
        },
        orderBy: {
            id: "asc"
        }
    })

    const exportRows = users.map((user) => ({
        id: user.id,
        name: user?.individual?.full_Name || user?.business?.business_Name || "",
        email: user.email,
        phone: user.phone,
        type: user.type,
        role: user.role,
        status: user.status
    }))

    const parser = new Parser({
        fields: ["id", "name", "email", "phone", "type", "role", "status"]
    })
    const csv = parser.parse(exportRows)

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename=users-export.csv`)
    res.status(StatusCodes.OK).send(csv)
}

const exportShipmentsCSV = async (req,res,next) => {
    const shipments = await prisma.shipment.findMany({
        orderBy: {
            shipment_ID: "asc"
        }
    })

    const exportRows = shipments.map((shipment) => ({
        shipment_ID: shipment.shipment_ID,
        user_ID: shipment.user_ID,
        origin: shipment.origin,
        destination: shipment.destination,
        volume: shipment.volume,
        weight: shipment.weight,
        date: shipment.date,
        priority: shipment.priority,
        status: shipment.status
    }))

    const parser = new Parser({
        fields: [
            "shipment_ID",
            "user_ID",
            "origin",
            "destination",
            "volume",
            "weight",
            "date",
            "priority",
            "status"
        ]
    })
    const csv = parser.parse(exportRows)

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename=shipments-export.csv`)
    res.status(StatusCodes.OK).send(csv)
}

const exportRoutesCSV = async (req,res,next) => {
    const routes = await prisma.route.findMany({
        orderBy: {
            route_ID: "asc"
        }
    })

    const exportRows = routes.map((route) => ({
        route_ID: route.route_ID,
        user_ID: route.user_ID,
        vehicle_plate: route.vehicle_plate,
        origin: route.origin,
        destination: route.destination,
        region: route.region,
        date: route.date,
        status: route.status,
        more_Information: route.more_Information || ""
    }))

    const parser = new Parser({
        fields: [
            "route_ID",
            "user_ID",
            "vehicle_plate",
            "origin",
            "destination",
            "region",
            "date",
            "status",
            "more_Information"
        ]
    })
    const csv = parser.parse(exportRows)

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename=routes-export.csv`)
    res.status(StatusCodes.OK).send(csv)
}

module.exports = {
    listUsers,
    getUser,
    activateUser,
    suspendUser,
    getDashboardStats,
    exportUsersCSV,
    exportShipmentsCSV,
    exportRoutesCSV
}