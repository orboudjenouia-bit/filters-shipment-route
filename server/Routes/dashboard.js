const express = require('express');
const router = express.Router();
const checkToken = require('../Middlewares/checkToken');
const asyncHandler = require('../utils/asyncHandler');

const { getStats } = require('../Controllers/dashboardController');

router.get('/stats', checkToken, asyncHandler(getStats));

module.exports = router;
