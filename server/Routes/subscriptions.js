const router = require("express").Router()
const asyncHandler = require("../utils/asyncHandler")
const checkToken = require("../Middlewares/checkToken")
const checkAdmin = require("../Middlewares/checkPermissions")
const requireProfile = require("../Middlewares/requireProfile")
const { check } = require('express-validator')

const { listSubscriptions, getMySub, newSub, updateSub, deleteSub, viewSub } = require("../Controllers/subscriptionsController")

router.get('/', checkToken, checkAdmin, asyncHandler(listSubscriptions))
router.get('/me', checkToken, requireProfile, asyncHandler(getMySub))
router.get('/:id', checkToken, asyncHandler(viewSub))
router.post('/', checkToken, requireProfile, asyncHandler(newSub))
router.patch('/:id', checkToken, asyncHandler(updateSub))
router.delete('/:id', checkToken, asyncHandler(deleteSub))


module.exports = router


