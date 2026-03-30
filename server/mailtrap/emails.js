const crypto = require("crypto")
const { MailtrapClient } = require("mailtrap")
const { VERIFICATION_EMAIL_TEMPLATE } = require("./emailTemplate.js")
const AppError = require("../utils/AppError.js")
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

const snedverificationemail = async (email, Tokenn) => {
  try {
    if (!mailtrapClient) {
      throw new Error("Mailtrap client not initialized. Check MAILTRAP_TOKEN in .env");
    }
    await mailtrapClient.send({
      from: sender,
      to: [{ email: email }],
      subject: "Email Verification",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", Tokenn),
      category: "verification"
    });
    console.log("✓ Verification email sent to:", email);
  } catch (error) {
    console.error("Mailtrap error:", error.message);
    throw new AppError("Failed to send verification email", 500)
  }
}

module.exports = { snedverificationemail }