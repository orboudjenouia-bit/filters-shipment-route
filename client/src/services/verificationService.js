import API_URL, { parseJson } from "./http";

export const verifyCode = async (code) => {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Verification failed",
    };
  }

  return data;
};
