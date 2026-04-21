const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";
export const API_BASE_URL = API_URL.replace(/\/api\/?$/, "");

export const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const createApiError = ({ message, status, code, payload } = {}) => {
  const error = new Error(message || "Request failed");
  error.status = Number.isFinite(Number(status)) ? Number(status) : 0;
  error.code = code;
  error.payload = payload;
  return error;
};

export const extractApiMessage = (payload, fallback = "Request failed") => {
  if (payload && typeof payload === "object") {
    const message = payload.message || payload.msg || payload.error;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  return fallback;
};

export const getAuthHeaders = () => {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw { status: 401, code: "NO_TOKEN", message: "Please login first." };
  }

  return token;
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

export const requestJson = async (
  url,
  options = {},
  { fallbackMessage = "Request failed", authAware = true } = {}
) => {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    const rawMessage = String(error?.message || "").trim();
    const message =
      rawMessage.toLowerCase() === "failed to fetch"
        ? "Unable to reach server. Please check your connection and try again."
        : rawMessage || "Unable to reach server.";

    throw createApiError({
      message,
      status: 0,
      code: "NETWORK_ERROR",
    });
  }

  const data = await parseJson(response);

  if (!response.ok) {
    if (authAware) {
      handleAuthFailure(response, data);
    }

    throw createApiError({
      message: extractApiMessage(data, `${fallbackMessage} (${response.status})`),
      status: response.status,
      code: data?.code,
      payload: data,
    });
  }

  return data;
};

export default API_URL;