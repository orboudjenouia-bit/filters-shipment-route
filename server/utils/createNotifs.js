const AppError = require("./AppError")
const { StatusCodes } = require('http-status-codes');
const prisma = require("../config/prismaClient")


const createNotifs = async (
    userID, title, message, type, entityType = "NONE", entityID = 0
) => {
    if (!userID || !title || !type) {
        console.error("No Enough data to create notification")
        return null
    }

    userID = parseInt(userID)

    if (!userID) {
        console.error("Invalid IDs to create Notification")
        return null
    }

    if (entityID === undefined || entityID === 0 || entityID === "") {
        entityID = 0
    } else {
        entityID = parseInt(entityID)
        if (!entityID) {
            console.error("Invalid IDs to create Notification")
            return null
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
        console.error("Error Creating Notification")
        return null
    }
    
}

module.exports = createNotifs