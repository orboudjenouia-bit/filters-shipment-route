import API_URL, { getAuthHeaders, handleAuthFailure, parseJson } from "./http";

export const getAdminDashboardStats = async () => {
  const response = await fetch(`${API_URL}/admin/Dashboard`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
};

export const getAdminUsers = async () => {
  const response = await fetch(`${API_URL}/admin/users`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return Array.isArray(data?.users) ? data.users : [];
};

export const activateAdminUser = async (id) => {
  const response = await fetch(`${API_URL}/admin/users/${encodeURIComponent(String(id))}/activate`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
};

export const suspendAdminUser = async (id) => {
  const response = await fetch(`${API_URL}/admin/users/${encodeURIComponent(String(id))}/suspend`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
};

const extractFilename = (contentDisposition, fallback) => {
  const value = String(contentDisposition || "");
  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);

  const basicMatch = value.match(/filename="?([^";]+)"?/i);
  if (basicMatch?.[1]) return basicMatch[1];

  return fallback;
};

const downloadCsvEndpoint = async (endpoint, fallbackName) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await parseJson(response);
    handleAuthFailure(response, data);
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const blob = await response.blob();
  const filename = extractFilename(response.headers.get("content-disposition"), fallbackName);

  return { blob, filename };
};

export const exportUsersCsv = async () =>
  downloadCsvEndpoint("/admin/users/export/csv", "users-export.csv");

export const exportShipmentsCsv = async () =>
  downloadCsvEndpoint("/admin/shipments/export/csv", "shipments-export.csv");

export const exportRoutesCsv = async () =>
  downloadCsvEndpoint("/admin/routes/export/csv", "routes-export.csv");
