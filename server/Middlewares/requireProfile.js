const { StatusCodes } = require('http-status-codes');
const prisma = require('../config/prismaClient');
const AppError = require('../utils/AppError');

const requireProfile = async (req, res, next) => {
    const userId = req.user.id;

    if (!userId) {
        throw new AppError(
            'Authentication required',
            StatusCodes.UNAUTHORIZED,
            'UNAUTHORIZED'
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            role: true,
            type: true,
            individual: { select: { user_ID: true } },
            business: { select: { user_ID: true } },
        },
    });

    if (!user) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
    }

    if (user.role === 'ADMIN') {
        return next();
    }

    const hasProfile = Boolean(user.individual || user.business);

    if (hasProfile) {
        return next();
    }

    throw new AppError(
        'Profile is incomplete. Please complete your profile to access this resource.',
        StatusCodes.FORBIDDEN,
        'PROFILE_INCOMPLETE'
    );
};

module.exports = requireProfile;