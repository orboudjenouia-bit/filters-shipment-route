const express = require("express") 
const router = express.Router()
const { check } = require('express-validator')
const authToken = require("../Middlewares/checkToken")
const asyncHandler = require("../utils/asyncHandler")

const {listShipments, makePost, editShipment, deleteShipment} = require("../Controllers/shipmentController")

router.get('/', authToken, asyncHandler(listShipments)) 

router.post('/',
  authToken,
  [
    check('origin', 'Origin is required').notEmpty().isString(),
    check('destination', 'Destination is required').notEmpty().isString(),
    check('volume', 'Volume is required and must be a number').notEmpty().isNumeric(),
    check('weight', 'Weight is required and must be a number').notEmpty().isNumeric(),
    check('date', 'Date must be in format YYYY-MM-DD').matches(/^\d{4}-\d{2}-\d{2}$/),
    check('priority', 'Priority must be Normal, High, or Urgent').optional().isIn(['Normal', 'High', 'Urgent']),
  ],
  asyncHandler(makePost)
)

router.patch('/',
  authToken,
  [
    check('shipment_ID', 'Shipment ID is required and must be a number').notEmpty().isNumeric(),
    check('origin', 'Origin must be a string').optional().isString(),
    check('destination', 'Destination must be a string').optional().isString(),
    check('volume', 'Volume must be a number').optional().isNumeric(),
    check('weight', 'Weight must be a number').optional().isNumeric(),
    check('date', 'Date must be in format YYYY-MM-DD').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    check('priority', 'Priority must be Normal, High, or Urgent').optional().isIn(['Normal', 'High', 'Urgent'])
  ],
  asyncHandler(editShipment)
)

router.delete('/:id', authToken, asyncHandler(deleteShipment)) 

module.exports = router