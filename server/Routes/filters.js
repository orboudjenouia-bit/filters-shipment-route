const express = require('express');
const router = express.Router();
const checkToken = require('../Middlewares/checkToken');
const checkActivate = require('../Middlewares/CheckActivate');
const asyncHandler = require('../utils/asyncHandler');

const { filterShipments, filterRoutes } = require('../Controllers/filtersController');

router.get('/shipments', checkToken, checkActivate, asyncHandler(filterShipments))
router.get('/routes', checkToken, checkActivate, asyncHandler(filterRoutes))

module.exports = router;
