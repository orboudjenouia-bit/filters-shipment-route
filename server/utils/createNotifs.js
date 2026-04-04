const AppError = require("./AppError")
const { StatusCodes } = require('http-status-codes');
const prisma = require("../config/prismaClient")


const createNotifs = async (
    userID, title, message, type, entityType = "NONE", entityID = 0
) => {
    if (!userID || !title || !type) {
        throw new AppError(
            "No Enough data to create notification",
            StatusCodes.BAD_REQUEST,
            "NO_NOTIFS")
    }

    userID = parseInt(userID)

    if (!userID) {
        throw new AppError(
            "Invalid IDs to create Notification",
            StatusCodes.BAD_REQUEST,
            "NO_NOTIFS")
    }

    if (entityID === undefined || entityID === 0 || entityID === "") {
        entityID = 0
    } else {
        entityID = parseInt(entityID)
        if (!entityID) {
            throw new AppError(
                "Invalid IDs to create Notification",
                StatusCodes.BAD_REQUEST,
                "NO_NOTIFS")
        }
    }
    try {
        const notif = await prisma.notification.create({
            data: {
                user_ID: userID,
                title, message, type,
                entityType, entityID
            }
        })    
        return notif
    } catch (error) {
        console.log(error)
        throw new AppError("Error Creating Notification",
            StatusCodes.INTERNAL_SERVER_ERROR,
            "PRISMA_ERROR"
        )
    }
    
}

module.exports = createNotifs