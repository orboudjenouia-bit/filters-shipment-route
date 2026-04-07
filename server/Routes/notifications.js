const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const checkToken = require('../Middlewares/checkToken');
const requireProfile = require('../Middlewares/requireProfile');
const { check } = require('express-validator');
const { getAllNotifs, getNotif, newNotif, deleteNotif, readAll, readMany } = require('../Controllers/notificationsController')

router.get('/all', checkToken, requireProfile, asyncHandler(getAllNotifs))
router.get('/:id', checkToken, requireProfile, asyncHandler(getNotif))
router.patch('/read-all', checkToken, requireProfile, asyncHandler(readAll))
router.patch('/read-many', checkToken, requireProfile, asyncHandler(readMany))
router.post('/', 
    checkToken,
    requireProfile,
    [
        check('title', 'Title is required').notEmpty().isString(),
        check('message', 'Message is required').notEmpty().isString(),
        check('type', 'Type is required').notEmpty().isString()
            .trim()
            .toLowerCase()
            .isIn(['shipments', 'alerts', 'routes', 'account']),
        check('entityType', 'Entity type must be a string').notEmpty().isString(),
        check('entityID', 'Entity ID must be a number').notEmpty().isNumeric(),
    ],
    asyncHandler(newNotif)
)
router.delete('/:id', checkToken, requireProfile, asyncHandler(deleteNotif))


module.exports = router