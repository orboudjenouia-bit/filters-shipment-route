const express = require('express')
const router = express.Router()
const authToken = require("../Middlewares/checkToken")
const asyncHandler = require("../utils/asyncHandler")

const { getStats } = require("../Controllers/dashboardController")

router.get("/stats", authToken, asyncHandler(getStats))

module.exports = router