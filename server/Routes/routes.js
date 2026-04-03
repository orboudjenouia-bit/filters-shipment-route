const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authToken = require('../Middlewares/checkToken');
const asyncHandler = require('../utils/asyncHandler');

const {
    listRoutes,
    postRoute,
    editRoute,
    deleteRoute,
} = require('../Controllers/routesController');

router.get('/', authToken, asyncHandler(listRoutes));

router.post(
    '/',
    authToken,
    [
        check('name', 'Route name is required').notEmpty().isString(),
        check('photo', 'Photo must be a string').optional().isString(),
        check('origin', 'Origin must be a string')
            .optional({ nullable: true })
            .isString(),
        check('destination', 'Destination must be a string')
            .optional({ nullable: true })
            .isString(),
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
    ],
    asyncHandler(postRoute)
);

router.patch(
    '/',
    authToken,
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
    ],
    asyncHandler(editRoute)
);

router.delete('/:id', authToken, asyncHandler(deleteRoute));

module.exports = router;
