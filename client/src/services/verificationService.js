import API_URL, { requestJson } from "./http";

export const verifyCode = async (code) => {
  return requestJson(
    `${API_URL}/auth/verify-email`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    },
    { fallbackMessage: "Verification failed", authAware: false }
  );
};

export const resendVerificationCode = async (email) => {
  return requestJson(
    `${API_URL}/auth/resend-verification`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
    { fallbackMessage: "Failed to resend code", authAware: false }
  );
};