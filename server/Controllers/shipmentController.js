const prisma = require('../config/prismaClient');
const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { StatusCodes } = require('http-status-codes');
const createNotifs = require('../utils/createNotifs');


const listShipments = async (req, res, next) => {
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
    });
    const total = await prisma.shipment.count();
    res.status(StatusCodes.OK).json({
        success: true,
        total,
        shipments: allShipments,
    });
};

const listMyShipments = async (req, res, next) => {
    const myShipments = await prisma.shipment.findMany({
        where: { user_ID: req.user.id },
        orderBy: { shipment_ID: 'desc' },
    });

    res.status(StatusCodes.OK).json({
        success: true,
        total: myShipments.length,
        shipments: myShipments,
    });
};

const makePost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation Failed', StatusCodes.BAD_REQUEST,'VALIDATION_ERROR');
    }

    const shipment = {
        user_ID: req.user.id,
        ...req.body,
    }; 

    const newShipment = await prisma.shipment.create({
        data: shipment,
    });

    await createNotifs(
        req.user.id,
        'Shipment Created',
        `Shipment ${newShipment.shipment_ID} Created Successfully`,
        'shipments',
        'shipment',
        newShipment.shipment_ID
    )

    res.status(StatusCodes.CREATED).json(newShipment);

};

const editShipment = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation Failed', StatusCodes.BAD_REQUEST,'VALIDATION_ERROR');
    }

    const { shipment_ID, ...fields } = req.body;
    const shipmentId = parseInt(shipment_ID);  

    const shipment = await prisma.shipment.findUnique({
        where: { shipment_ID: shipmentId },
    });

    if (!shipment || shipment.user_ID != req.user.id) {
        throw new AppError('Not authorized to update this shipment', StatusCodes.FORBIDDEN, 'FORBIDDEN');
    }

    const updateshipment = await prisma.shipment.update({
        where: { shipment_ID: shipmentId },
        data: fields,
    });

    await createNotifs(
        req.user.id,
        'Shipment Updated',
        `Shipment ${shipmentId} Updated Successfully`,
        'shipments',
        'shipment',
        shipmentId
    )

    res.status(StatusCodes.OK).json({
        msg: 'Shipment Updated Successfully',
        data: updateshipment,
    });
};

const deleteShipment = async (req, res, next) => {
    const id = parseInt(req.params.id);

    const shipment = await prisma.shipment.findUnique({
        where: { shipment_ID: id },
    });

    if (!shipment || shipment.user_ID != req.user.id) {
        throw new AppError(
            'Not authorized to delete this shipment',
            StatusCodes.FORBIDDEN,
            'FORBIDDEN'
        );
    }

    const deletedShipment = await prisma.shipment.delete({
        where: { shipment_ID: id },
    });

    await createNotifs(
        req.user.id,
        'Shipment Deleted',
        `Shipment ${id} Deleted Successfully`,
        'shipments',
        'shipment',
        id
    )

    res.status(StatusCodes.OK).json({ msg: 'Shipment Deleted Successfully' });
};

module.exports = { listShipments, listMyShipments, makePost, editShipment, deleteShipment };
