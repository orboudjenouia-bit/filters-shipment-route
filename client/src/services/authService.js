import API_URL, { parseJson } from "./http";

export const register = async (email, password, phone, type) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({ email, password, phone, type }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Registration Failed",
    };
  }

  return data;
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Login failed",
    };
  }

  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/auth/forget-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to send reset email",
    };
  }

  return data;
};

export const resetPassword = async (token, password) => {
  const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to reset password",
    };
  }

  return data;
};
