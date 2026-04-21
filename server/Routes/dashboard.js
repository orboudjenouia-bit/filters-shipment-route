const express = require('express');
const router = express.Router();
const checkToken = require('../Middlewares/checkToken');
const requireProfile = require('../Middlewares/requireProfile');
const asyncHandler = require('../utils/asyncHandler');

const { getStats } = require('../Controllers/dashboardController');

router.get('/stats', checkToken, requireProfile, asyncHandler(getStats));

module.exports = router;
