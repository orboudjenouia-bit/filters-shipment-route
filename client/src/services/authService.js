import API_URL, { getAuthHeaders, requestJson } from "./http";

export const register = async (email, password, phone, type) => {
  return requestJson(
    `${API_URL}/auth/register`,
    {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ email, password, phone, type }),
    },
    { fallbackMessage: "Registration failed", authAware: false }
  );
};

export const login = async (email, password) => {
  return requestJson(
    `${API_URL}/auth/login`,
    {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    },
    { fallbackMessage: "Login failed", authAware: false }
  );
};

export const forgotPassword = async (email) => {
  return requestJson(
    `${API_URL}/auth/forget-password`,
    {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    },
    { fallbackMessage: "Failed to send reset email", authAware: false }
  );
};

export const resetPassword = async (token, password) => {
  return requestJson(
    `${API_URL}/auth/reset-password/${token}`,
    {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
    },
    { fallbackMessage: "Failed to reset password", authAware: false }
  );
};

export const logout = async () => {
  let headers;

  try {
    headers = getAuthHeaders();
  } catch (err) {
    return { success: true, msg: "Already logged out" };
  }

  return requestJson(
    `${API_URL}/auth/logout`,
    {
      method: "POST",
      headers,
    },
    { fallbackMessage: "Logout failed", authAware: true }
  );
};
