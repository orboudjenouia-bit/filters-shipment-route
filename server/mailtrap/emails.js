const { VERIFICATION_EMAIL_TEMPLATE } = require("./emailTemplate") 
const { mailtrapClient, sender } = require("mailtrap")
const AppError = require("../utils/AppError.js")

const snedverificationemail = async (email, token) => {
  const recipient = [{ email }]

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Email Verification",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationURL}", token),
      category: "verification"
    })
    return response
  } catch (error) {
    throw new AppError("Failed to send verification email", 500)
  }
}

module.exports = { snedverificationemail }