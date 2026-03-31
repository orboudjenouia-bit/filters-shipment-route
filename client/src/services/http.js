const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw { status: 401, code: "NO_TOKEN", message: "Please login first." };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const emitAuthLogout = (reason = "session-invalid") => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("auth:logout", { detail: { reason } }));
};

export const handleAuthFailure = (response, data = {}) => {
  const status = Number(response?.status);
  const code = String(data?.code || "").toUpperCase();
  const message = String(data?.message || "").toLowerCase();

  const shouldLogout =
    status === 401 ||
    (status === 404 && code === "USER_NOT_FOUND") ||
    (status === 404 && message.includes("user not found"));

  if (!shouldLogout) return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  emitAuthLogout(code || "AUTH_INVALID");
};

export default API_URL;