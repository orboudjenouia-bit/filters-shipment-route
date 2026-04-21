const prisma = require('../config/prismaClient');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/AppError');

async function findOrCreateUser(googleUserData) {
  try {
    const { googleId, email, name, picture } = googleUserData;

    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        phone: true,
        type: true,
        role: true,
        isVerified: true,
        profile_Photo: true,
      },
    });

    if (user) {
      return user;
    }

    user = await prisma.user.create({
      data: {
        email,
        type: 'INDIVIDUAL',
        role: 'USER',
        status: 'ACTIVE',
        isVerified: true,
        profile_Photo: picture,
        password: 'oauth_' + googleId,
        phone: '0000000000',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        type: true,
        role: true,
        isVerified: true,
        profile_Photo: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Google user service error:', error.message);
    throw new AppError(
      'Failed to process Google user',
      StatusCodes.INTERNAL_SERVER_ERROR,
      'GOOGLE_USER_FAILED'
    );
  }
}

async function getUserById(userId) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        type: true,
        role: true,
        isVerified: true,
        profile_Photo: true,
      },
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    return null;
  }
}

module.exports = {
  findOrCreateUser,
  getUserById,
};