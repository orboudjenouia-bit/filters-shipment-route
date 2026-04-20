const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authToken = require('../Middlewares/checkToken');
const requireProfile = require('../Middlewares/requireProfile');
const asyncHandler = require('../utils/asyncHandler');

const {
    listShipments,
    listMyShipments,
    makePost,
    editShipment,
    deleteShipment,
} = require('../Controllers/shipmentController');

router.get('/', authToken, requireProfile, asyncHandler(listShipments));
router.get('/me', authToken, requireProfile, asyncHandler(listMyShipments));

router.post(
    '/',
    authToken,
    requireProfile,
    [
        check('title', 'Title is required').notEmpty().isString(),
        check('category', 'Category is required').notEmpty().isString(),
        check('photo', 'Photo must be a string').optional(),
        check('origin', 'Origin is required').notEmpty().isString(),
        check('destination', 'Destination is required').notEmpty().isString(),
        check('volume', 'Volume is required and must be a number')
            .notEmpty()
            .isFloat({ gt: 0 }),
        check('weight', 'Weight is required and must be a number')
            .notEmpty()
            .isFloat({ gt: 0 }),
        check('price', 'Price is required and must be a number')
            .notEmpty()
            .isFloat({ gt: 0 }),
        check('date', 'Date must be in format YYYY-MM-DD').matches(
            /^\d{4}-\d{2}-\d{2}$/
        ),
        check('time', 'Time must be in format HH:MM')
            .notEmpty()
            .matches(/^\d{2}:\d{2}$/),
        check('priority', 'Priority must be Normal, High, or Urgent')
            .optional()
            .isIn(['Normal', 'High', 'Urgent']),
    ],
    asyncHandler(makePost)
);

router.patch(
    '/',
    authToken,
    requireProfile,
    [
        check('shipment_ID', 'Shipment ID is required and must be a number')
            .notEmpty()
            .isNumeric(),
        check('title', 'Title must be a string').optional().isString(),
        check('category', 'Category must be a string').optional().isString(),
        check('photo', 'Photo must be a string').optional().isString(),
        check('origin', 'Origin must be a string').optional().isString(),
        check('destination', 'Destination must be a string')
            .optional()
            .isString(),
        check('volume', 'Volume must be a positive number')
            .optional()
            .isFloat({ gt: 0 }),
        check('weight', 'Weight must be a positive number')
            .optional()
            .isFloat({ gt: 0 }),
        check('price', 'Price must be a positive number')
            .optional()
            .isFloat({ gt: 0 }),
        check('date', 'Date must be in format YYYY-MM-DD')
            .optional()
            .matches(/^\d{4}-\d{2}-\d{2}$/),
        check('time', 'Time must be in format HH:MM')
            .optional()
            .matches(/^\d{2}:\d{2}$/),
        check('priority', 'Priority must be Normal, High, or Urgent')
            .optional()
            .isIn(['Normal', 'High', 'Urgent']),
        check('special_Information', 'Special information must be a string')
            .optional()
            .isString(),
        check('status', 'Status must be In-Stock, In-Delivery, or Delivered')
            .optional()
            .isIn(['In-Stock', 'In-Delivery', 'Delivered']),
    ],
    asyncHandler(editShipment)
);

router.delete('/:id', authToken, requireProfile, asyncHandler(deleteShipment));

module.exports = router;
