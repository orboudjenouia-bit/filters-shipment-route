const router = require("express").Router();
const { check } = require("express-validator");
const authToken = require("../Middlewares/checkToken");
const asyncHandler = require("../utils/asyncHandler");
const { IndividualProfile, BusinessProfile } = require("../Controllers/authController");
const { getShipmentHistory, getRouteHistory, listVehicles, createVehicle, updateVehicle, deleteVehicle, getMyProfile } = require('../Controllers/profileController')

router.get("/me", authToken, asyncHandler(getMyProfile));

router.post(
  "/individual",
  authToken,
  [
    check("full_Name", "Full name is required").notEmpty().isString(),
    check("nin", "National ID is required").notEmpty().isString(),
    check("location", "Location is required").notEmpty().isString(),
  ],
  asyncHandler(IndividualProfile)
);

router.post(
  "/business",
  authToken,
  [
    check("business_Name", "Business name is required").notEmpty().isString(),
    check("rc_Number", "RC number is required").notEmpty().isString(),
    check("form", "Legal form is required").notEmpty().isString(),
    check("nif", "NIF must be a number").isInt(),
    check("nis", "NIS must be a number").isInt(),
    check("locations", "Locations must be a non-empty array").isArray({ min: 1 }),
  ],
  asyncHandler(BusinessProfile)
);


router.get('/historyShipments', asyncHandler(getShipmentHistory) )
router.get('/historyRoutes', asyncHandler(getRouteHistory) )


router.get('/vehicles', asyncHandler(listVehicles) )
// router.get('/vehicles/:id')
router.post('/vehicles', asyncHandler(createVehicle) )
router.patch('/vehicles', asyncHandler(updateVehicle) )
router.delete('/vehicles', asyncHandler(deleteVehicle) )


module.exports = router;
