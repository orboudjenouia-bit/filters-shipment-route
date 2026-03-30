const crypto = require("crypto")
const bcrypt = require("bcrypt")
const { MailtrapClient } = require("mailtrap")
const { PASSWORD_RESET_REQUEST_TEMPLATE  ,PASSWORD_RESET_SUCCESS_TEMPLATE } = require("../mailtrap/emailTemplate.js")
const AppError = require("../utils/AppError.js")
const asyncHandler = require("../utils/asyncHandler.js")
const prisma = require("../config/prismaClient")
const { StatusCodes } = require("http-status-codes")
const { validationResult } = require("express-validator")


let mailtrapClient
try {
  mailtrapClient = new MailtrapClient({
    token: process.env.MAILTRAP_TOKEN,
  })
} catch (err) {
  console.log("Failed to initialize Mailtrap:", err.message)
}


const sender = {
  email: process.env.MAILTRAP_FROM_EMAIL || "hello@example.com",
  name: "wesseli-support"
}


const forgotpassword = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR")
  }

  const { email } = req.body

  const exists = await prisma.user.findUnique({
    where: { email: email }
  })

  if (!exists) {
    return next(new AppError("Email does not exist in our database", StatusCodes.BAD_REQUEST, "EMAIL_NOT_FOUND"))
  }

  const resetToken = crypto.randomBytes(32).toString("hex")
  const resetTokenExpires = new Date(Date.now() +  1 * 60 *  60 * 1000)

  await prisma.user.update({
    where: { email: email },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpires
    }
  })

  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000"
  const resetLink = `${clientUrl}/resetpassword/${resetToken}`

  let delivery = "email"
  if (mailtrapClient) {
    await SendPasswordResetEmail(email, resetLink)
  } else {
    delivery = "preview"
    console.log("Mailtrap is not configured. Use this reset link for testing:", resetLink)
  }

  res.status(200).json({
    success: true,
    msg: "Password reset request processed successfully",
    delivery,
    resetLink: delivery === "preview" ? resetLink : undefined,
  })
})

const SendPasswordResetEmail = async (email, resetLink) => {
  if (!mailtrapClient) {
    throw new AppError("Email service is unavailable", StatusCodes.SERVICE_UNAVAILABLE, "EMAIL_SERVICE_UNAVAILABLE")
  }

  try {
    await mailtrapClient.send({
      from: sender,
      to: [{ email: email }],
      subject: "Password Reset Request",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetLink),
      category: "password-reset"
    })
  } catch (error) {
    throw new AppError("Failed to send password reset email", StatusCodes.INTERNAL_SERVER_ERROR, "EMAIL_SEND_FAILED")
  }
}


const resetpswd = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw new AppError("Validation failed", StatusCodes.BAD_REQUEST, "VALIDATION_ERROR")
  }

  const { token } = req.params
  const { password } = req.body

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date()
      }
    }
  })

  if (!user) {
    return next(new AppError("Invalid or expired token", StatusCodes.BAD_REQUEST, "INVALID_RESET_TOKEN"))
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  })

  if (mailtrapClient) {
    await sendPasswordResetSuccessEmail(user.email)
  }
  res.status(200).json({ success: true, msg: "Password reset successful" })
})



const sendPasswordResetSuccessEmail = async (email) => {
  if (!mailtrapClient) {
    return;
  }

  try {
    await mailtrapClient.send({
      from: sender,
      to: [{ email: email }],
      subject: "Password Reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "password-reset"
    })
  } catch (error) {
    throw new AppError("Failed to send password reset success email", StatusCodes.INTERNAL_SERVER_ERROR, "EMAIL_SEND_FAILED")
  }
}

module.exports = { forgotpassword, resetpswd }
