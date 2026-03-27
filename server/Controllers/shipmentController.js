const prisma = require("../config/prismaClient")
const { validationResult } = require('express-validator')
const AppError = require("../utils/AppError")
const { StatusCodes } = require("http-status-codes");




const listShipments = async (req, res,next) => {
    
    const allShipments = await prisma.shipment.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
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
    if (!allShipments) {
        throw new AppError("No Shipments Created", StatusCodes.NOT_FOUND, "NO_SHIPMENTS")
    }
    const total = await prisma.shipment.count()
    res.status(StatusCodes.OK).json({allShipments})
}

const makePost = async (req, res,next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        throw new AppError("Validation Failed", StatusCodes.BAD_REQUEST,"VALIDATION_ERROR")
    }
    
    const shipment = {
        user_ID: req.user.id,
        ...req.body
    } 
    
    const newShipment = await prisma.shipment.create({
        data: shipment  
    })
    res.status(StatusCodes.CREATED).json(newShipment)

}

const editShipment = async (req, res,next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        throw new AppError("Validation Failed", StatusCodes.BAD_REQUEST,"VALIDATION_ERROR")
    }

    const { shipment_ID, ...fields } = req.body
    const shipmentId = parseInt(shipment_ID)  

    const shipment = await prisma.shipment.findUnique({
        where: { shipment_ID: shipmentId }
        })

    if (!shipment || shipment.user_ID != req.user.id) {
        throw new AppError("Not authorized to update this shipment", StatusCodes.FORBIDDEN, "FORBIDDEN")
    }

    const updateshipment = await prisma.shipment.update({
        where: { shipment_ID: shipmentId },
        data: fields
    })
    res.status(StatusCodes.OK).json({ msg: "Shipment Updated Successfully", data: updateshipment })
}

const deleteShipment =  async (req, res,next) => {
    const {id} = req.params
    
    const shipment = await prisma.shipment.findUnique({
        where: { shipment_ID: parseInt(id) }
        })

    if (!shipment || shipment.user_ID != req.user.id) {
         throw new AppError("Not authorized to delete this shipment", StatusCodes.FORBIDDEN, "FORBIDDEN")
    }

    const deletedShipment = await prisma.shipment.delete({
        where: { shipment_ID: parseInt(id) }
    })
    res.status(StatusCodes.OK).json({ msg: "Shipment Deleted Successfully" })
}

module.exports = {listShipments, makePost, editShipment, deleteShipment }