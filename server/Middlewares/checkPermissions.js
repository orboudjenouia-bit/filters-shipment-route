const prisma = require("../config/prismaClient")
const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/AppError')

const checkAdmin = async (req,res,next) => {

    const id = parseInt(req.user.id)
    const user = await prisma.user.findUnique({
        where: { id: id },
        select: {
            role: true
        }
    })

    if (!user || user.role !== "ADMIN") {
        throw new AppError("Unauthorized Action", StatusCodes.FORBIDDEN, "FORBIDDEN")
    }
    next()
}


module.exports = checkAdmin