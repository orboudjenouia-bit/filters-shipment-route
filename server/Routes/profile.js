const router = require('express').Router();
const { check } = require('express-validator');
const checkToken = require('../Middlewares/checkToken');
const requireProfile = require('../Middlewares/requireProfile');
const asyncHandler = require('../utils/asyncHandler');
const {
    IndividualProfile,
    BusinessProfile,
} = require('../Controllers/authController');
const {
    getShipmentHistory,
    getRouteHistory,
    listVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getMyProfile,
    getPublicProfile,
} = require('../Controllers/profileController');

router.get('/me', checkToken, asyncHandler(getMyProfile));
router.get('/user/:userId', checkToken, requireProfile, asyncHandler(getPublicProfile));

router.post(
    '/individual',
    checkToken,
    [
        check('full_Name', 'Full name is required').notEmpty().isString(),
        check('nin', 'National ID is required').notEmpty().isString(),
        check('location', 'Location is required').notEmpty().isString(),
        check('photo', 'Photo must be a string').optional().isString(),
    ],
    asyncHandler(IndividualProfile)
);

router.post(
    '/business',
    checkToken,
    [
        check('business_Name', 'Business name is required')
            .notEmpty()
            .isString(),
        check('rc_Number', 'RC number is required').notEmpty().isString(),
        check('form', 'Legal form is required').notEmpty().isString(),
        check('nif', 'NIF must be a number').isInt(),
        check('nis', 'NIS must be a number').isInt(),
        check('locations', 'Locations must be a non-empty array').isArray({
            min: 1,
        }),
        check('photo', 'Photo must be a string').optional().isString(),
    ],
    asyncHandler(BusinessProfile)
);

router.get('/historyShipments', checkToken, requireProfile, asyncHandler(getShipmentHistory));
router.get('/historyRoutes', checkToken, requireProfile, asyncHandler(getRouteHistory));

router.get('/vehicles', checkToken, requireProfile, asyncHandler(listVehicles));
// router.get('/vehicles/:id')
router.post(
    '/vehicles',
    checkToken,
    requireProfile,
    [
        check('plate_Number', 'Plate number is required and must be numeric')
            .notEmpty()
            .isNumeric(),
        check('type', 'Vehicle type is required').notEmpty().isString(),
        check('vehicle_Name', 'Vehicle name is required').notEmpty().isString(),
        check('color', 'Color must be a string').optional().isString(),
        check('year', 'Year must be numeric').optional().isNumeric(),
        check('capacity', 'Capacity is required and must be numeric')
            .notEmpty()
            .isNumeric(),
        check('photo', 'Photo must be a string').optional(),
    ],
    asyncHandler(createVehicle)
);
router.patch(
    '/vehicles',
    checkToken,
    requireProfile,
    [
        check('plate_Number', 'Plate number is required and must be numeric')
            .notEmpty()
            .isNumeric(),
        check('type', 'Vehicle type must be a string').optional().isString(),
        check('vehicle_Name', 'Vehicle name must be a string')
            .optional()
            .isString(),
        check('color', 'Color must be a string').optional().isString(),
        check('year', 'Year must be numeric').optional().isNumeric(),
        check('capacity', 'Capacity must be numeric').optional().isNumeric(),
        check('photo', 'Photo must be a string').optional().isString(),
    ],
    asyncHandler(updateVehicle)
);
router.delete(
    '/vehicles',
    checkToken,
    requireProfile,
    [
        check('plate_Number', 'Plate number is required and must be numeric')
            .notEmpty()
            .isNumeric(),
    ],
    asyncHandler(deleteVehicle)
);

module.exports = router;
