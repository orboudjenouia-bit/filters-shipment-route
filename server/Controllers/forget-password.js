const crypto = require("crypto")
const bcrypt = require("bcrypt")
const { MailtrapClient } = require("mailtrap")
const { PASSWORD_RESET_REQUEST_TEMPLATE  ,PASSWORD_RESET_SUCCESS_TEMPLATE } = require("../mailtrap/emailTemplate.js")
const { send } = require("process")
const AppError = require("../utils/AppError.js")
const asyncHandler = require("../utils/asyncHandler.js")
const prisma = require("../config/prismaClient")


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
  const { email } = req.body

  const exists = await prisma.user.findUnique({
    where: { email: email }
  })

  if (!exists) {
    return next(new AppError("Email does not exist in our database", 400))
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
  try {
    await mailtrapClient.send({
      from: sender,
      to: [{ email: email }],
      subject: "Password Reset Request",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetLink),
      category: "password-reset"
    })
  } catch (error) {
    throw new AppError("Failed to send password reset email", 500)
  }
}


const resetpswd = asyncHandler(async (req, res, next) => {
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
    return next(new AppError("Invalid or expired token", 400))
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

  await sendPasswordResetSuccessEmail(user.email)
  res.status(200).json({ success: true, msg: "Password reset successful" })
})



const sendPasswordResetSuccessEmail = async (email) => {
  try {
    await mailtrapClient.send({
      from: sender,
      to: [{ email: email }],
      subject: "Password Reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "password-reset"
    })
  } catch (error) {
    throw new AppError("Failed to send password reset success email", 500)
  }
}

module.exports = { forgotpassword, resetpswd }
