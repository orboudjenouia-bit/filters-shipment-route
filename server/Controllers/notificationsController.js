const prisma = require('../config/prismaClient');
const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { StatusCodes } = require('http-status-codes');

const getAllNotifs = async (req,res,next) => {

    const id = req.user.id
    const notifications = await prisma.notification.findMany({
        where: { user_ID: id },
        orderBy: { createdAt: 'desc' }
    })
    const total = await prisma.notification.count({
        where: { user_ID: id}
    })
    res.status(StatusCodes.OK).json({
        success: true,
        total,
        data: notifications
    })
}

const getNotif = async (req,res,next) => {

    const userID = req.user.id
    const id = parseInt(req.params.id)
    const notification = await prisma.notification.findUnique({
        where: { 
            notif_ID: id
        },
    })
    
    if (!notification || notification.user_ID !== userID) {
        throw new AppError('Notification not found', StatusCodes.NOT_FOUND, 'NOT_FOUND');
    }
    
    const updatedNotification = await prisma.notification.update({
        where: { notif_ID: id },
        data: { isRead: true },
    })

    res.status(StatusCodes.OK).json({
        success: true,
        data: updatedNotification
    })

}

const readAll = async (req,res,next) => {

    const userID = req.user.id

    const result = await prisma.notification.updateMany({
        where: {
            user_ID: userID,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    })

    res.status(StatusCodes.OK).json({
        success: true,
        updated: result.count,
        message: 'All notifications marked as read'
    })
}

const readMany = async (req,res,next) => {

    const userID = req.user.id
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : []

    if (ids.length === 0) {
        throw new AppError('No notification IDs provided', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR')
    }

    const parsedIds = ids
        .map((id) => parseInt(id))
        .filter((id) => !Number.isNaN(id))

    if (parsedIds.length === 0) {
        throw new AppError('Invalid notification IDs', StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR')
    }

    const result = await prisma.notification.updateMany({
        where: {
            user_ID: userID,
            notif_ID: { in: parsedIds },
            isRead: false,
        },
        data: {
            isRead: true,
        },
    })

    res.status(StatusCodes.OK).json({
        success: true,
        updated: result.count,
        message: 'Selected notifications marked as read'
    })
}

const newNotif = async (req,res,next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError('Validation Failed', StatusCodes.BAD_REQUEST,'VALIDATION_ERROR');
    }

    const notif = {
        user_ID: req.user.id,
        ...req.body
    }

    const newNotification = await prisma.notification.create({
        data: notif
    })

    res.status(StatusCodes.CREATED).json({
        success: true,
        data: newNotification
    })
}

const deleteNotif = async (req,res,next) => {

    const id = parseInt(req.params.id)

    const notif = await prisma.notification.findUnique({
        where: { notif_ID: id}
    })
    
    if (!notif) {
        throw new AppError('Notification not found', StatusCodes.NOT_FOUND, 'NOT_FOUND');
    }
    
    if (req.user.id != notif.user_ID) {
        throw new AppError(
            'Not authorized to delete this notification',
            StatusCodes.FORBIDDEN,
            'FORBIDDEN'
        );
    }

    await prisma.notification.delete({
        where: { notif_ID: id}
    })
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Notification deleted successfully"
    })
}


module.exports = { getAllNotifs, getNotif, newNotif, deleteNotif, readAll, readMany }

