const express = require('express')
const router = express.Router()
const { check} = require('express-validator')
const authToken = require("../Middlewares/checkToken")
const asyncHandler = require("../utils/asyncHandler")

const {listRoutes, postRoute, editRoute, deleteRoute} = require("../Controllers/routesController")

router.get('/', authToken, asyncHandler(listRoutes))

router.post('/', 
  authToken,
  [
    check('origin', 'Origin is required and must be a string').notEmpty().isString(),
    check('destination', 'Destination is required and must be a string').notEmpty().isString(),
    check('region', 'Region is required').notEmpty(),
    check('date', 'Date must be in format YYYY-MM-DD').matches(/^\d{4}-\d{2}-\d{2}$/),
    check('vehicle_plate', 'Vehicle plate number is required').notEmpty().isNumeric(),
  ],
  asyncHandler(postRoute)
)

router.patch('/',
  authToken,
  [
    check('origin', 'Origin must be a string').optional().isString(),
    check('destination', 'Destination must be a string').optional().isString(),
    check('region', 'Region must be a string').optional().isString(),
    check('date', 'Date must be in format YYYY-MM-DD').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    check('vehicle_plate', 'Vehicle plate must be numeric').optional().isNumeric()
  ],
  asyncHandler(editRoute)
)

router.delete('/:id', authToken, asyncHandler(deleteRoute))

module.exports = router

