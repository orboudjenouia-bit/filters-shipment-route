const prisma = require('../config/prismaClient');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/AppError');


const checkActivate = async (req, res, next) => {
    const id = parseInt(req.user.id);
    const user = await prisma.user.findUnique({
        where: { id: id },
        select: {
            status: true,
        },
    });

    if (!user || user.status !== 'ACTIVE') {
        throw new AppError(
            'Unauthorized Action',
            StatusCodes.FORBIDDEN,
            'FORBIDDEN'
        );
    }
    next();
};
module.exports =  checkActivate ;