const router = require("express").Router();
const { check } = require("express-validator");
const { register, login } = require("../Controllers/authController");
const { forgotpassword, resetpswd } = require("../Controllers/forget-password");
const asyncHandler = require("../utils/asyncHandler");

router.post(
  "/register",
  [
    check("email", "Please provide a valid email").isEmail(),
    check(
      "password",
      "Password must be at least 10 Alphanumerical characters"
    )
      .isLength({ min: 10 }),
  ],
  asyncHandler(register)
);

router.post("/login", asyncHandler(login)); 
router.post("/reset-password/:token", asyncHandler(resetpswd))
router.post("/forget-password", asyncHandler(forgotpassword))

module.exports = router;

