const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authToken = require('../Middlewares/checkToken');
const requireProfile = require('../Middlewares/requireProfile');
const asyncHandler = require('../utils/asyncHandler');
const checkActivate = require('../Middlewares/CheckActivate');
const {
    listRoutes,
    listMyRoutes,
    postRoute,
    editRoute,
    deleteRoute,
} = require('../Controllers/routesController');

router.get('/', authToken, checkActivate, asyncHandler(listRoutes));
router.get('/me', authToken, checkActivate, asyncHandler(listMyRoutes));

router.post(
    '/',
    authToken,
    requireProfile,
    [
        check('name', 'Route name is required').notEmpty().isString(),
        check('photo', 'Photo must be a string').optional(),
        check('origin', 'Origin must be a string')
            .optional({ nullable: true })
            .isString(),
        check('destination', 'Destination must be a string')
            .optional({ nullable: true })
            .isString(),
        check('waypoints', 'Waypoints must be an array of strings')
            .optional({ nullable: true })
            .isArray(),
        check('waypoints.*', 'Each waypoint must be a non-empty string')
            .optional({ nullable: true })
            .isString()
            .trim()
            .notEmpty(),
        check('region', 'Region must be a string')
            .optional({ nullable: true })
            .isString(),
        check('date', 'Date must be in format YYYY-MM-DD')
            .optional({ nullable: true })
            .matches(/^\d{4}-\d{2}-\d{2}$/),
        check('vehicle_plate', 'Vehicle plate number is required')
            .notEmpty()
            .isNumeric(),
        check('post_type', 'Post type must be REGION or ORIGIN_DESTINATION')
            .optional()
            .isIn(['REGION', 'ORIGIN_DESTINATION']),
        check('date_type', 'Date type must be DAY or INTERVAL')
            .optional()
            .isIn(['DAY', 'INTERVAL']),
        check('interval_start', 'Interval start must be YYYY-MM-DD')
            .optional({ nullable: true })
            .matches(/^\d{4}-\d{2}-\d{2}$/),
        check('interval_end', 'Interval end must be YYYY-MM-DD')
            .optional({ nullable: true })
            .matches(/^\d{4}-\d{2}-\d{2}$/),
    ],checkActivate,
    asyncHandler(postRoute)
);

router.patch(
    '/',
    authToken,
    requireProfile,
    [
        check('route_ID', 'Route ID is required and must be numeric')
            .notEmpty()
            .isInt(),
        check('name', 'Route name must be a string').optional().isString(),
        check('photo', 'Photo must be a string').optional().isString(),
        check('origin', 'Origin must be a string').optional().isString(),
        check('destination', 'Destination must be a string')
            .optional()
            .isString(),
        check('waypoints', 'Waypoints must be an array of strings')
            .optional({ nullable: true })
            .isArray(),
        check('waypoints.*', 'Each waypoint must be a non-empty string')
            .optional({ nullable: true })
            .isString()
            .trim()
            .notEmpty(),
        check('region', 'Region must be a string').optional().isString(),
        check('date', 'Date must be YYYY-MM-DD or YYYY-MM-DD to YYYY-MM-DD')
            .optional()
            .matches(/^\d{4}-\d{2}-\d{2}(\s+to\s+\d{4}-\d{2}-\d{2})?$/),
        check('vehicle_plate', 'Vehicle plate must be numeric')
            .optional()
            .isNumeric(),
        check('post_type', 'Post type must be REGION or ORIGIN_DESTINATION')
            .optional()
            .isIn(['REGION', 'ORIGIN_DESTINATION']),
        check('date_type', 'Date type must be DAY or INTERVAL')
            .optional()
            .isIn(['DAY', 'INTERVAL']),
        check('interval_start', 'Interval start must be YYYY-MM-DD')
            .optional()
            .matches(/^\d{4}-\d{2}-\d{2}$/),
        check('interval_end', 'Interval end must be YYYY-MM-DD')
            .optional()
            .matches(/^\d{4}-\d{2}-\d{2}$/),
    ],checkActivate,
    asyncHandler(editRoute)
);

router.delete('/:id', authToken, checkActivate, asyncHandler(deleteRoute));

module.exports = router;
