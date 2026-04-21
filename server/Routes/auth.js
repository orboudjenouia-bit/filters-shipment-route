const router = require('express').Router();
const { check } = require('express-validator');
const { StatusCodes } = require('http-status-codes');
const prisma = require('../config/prismaClient');
const AppError = require('../utils/AppError');
const {
    register,
    login,
    logout,
    updateProfile,
    verifyEmail,
} = require('../Controllers/authController');
const { forgotpassword, resetpswd } = require('../Controllers/forget-password');
const asyncHandler = require('../utils/asyncHandler');
const checkToken = require('../Middlewares/checkToken');
const googleAuthRouter = require('./googleAuth');

router.post(
    '/register',
    [
        check('email', 'Please provide a valid email').isEmail(),
        check(
            'password',
            'Password must be at least 10 Alphanumerical characters'
        ).isLength({ min: 10 }),
    ],
    asyncHandler(register)
);

router.post(
    '/login',
    [
        check('email', 'Please provide a valid email').isEmail(),
        check('password', 'Password is required').notEmpty(),
    ],
    asyncHandler(login)
);
router.post(
    '/reset-password/:token',
    [
        check(
            'password',
            'Password must be at least 10 Alphanumerical characters'
        ).isLength({ min: 10 }),
    ],
    asyncHandler(resetpswd)
);
router.post(
    '/forget-password',
    [check('email', 'Please provide a valid email').isEmail()],
    asyncHandler(forgotpassword)
);
router.post('/logout', checkToken, asyncHandler(logout));

router.patch(
    '/update-profile',
    checkToken,
    [
        check('user', 'user must be an object').isObject(),
        check('profile', 'profile must be an object').isObject(),
        check('user.id', 'ID is Required').exists({ checkNull: true }).isInt(),
        check(
            'user.type',
            'type is REQUIRED and must be INDIVIDUAL or BUSINESS'
        )
            .exists({ checkNull: true })
            .isIn(['INDIVIDUAL', 'BUSINESS']),
        check('user.phone', 'Phone must be exactly 10 digits')
            .optional()
            .matches(/^\d{10}$/),
        check('user.working_Time', 'Working time format should be HH:MM-HH:MM')
            .optional()
            .matches(/^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/),
        check('profile.full_Name').optional().isString(), //individual
        check('profile.nin').optional().isString(),
        check('profile.location').optional().isString(),
        check('profile.business_Name').optional().isString(), //business
        check('profile.rc_Number').optional().isString(),
        check('profile.form').optional().isString(),
        check('profile.nif').optional().isInt(),
        check('profile.nis').optional().isInt(),
        check('profile.locations').optional().isArray({ min: 1 }),
    ],
    asyncHandler(updateProfile)
);






router.post('/verify-email', asyncHandler(verifyEmail));
router.use('/google', googleAuthRouter);
router.get('/me', checkToken, asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
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

    if (!user) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
    }

    res.json(user);
}));

module.exports = router;
