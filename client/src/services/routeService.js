import API_URL, { getAuthHeaders, handleAuthFailure, parseJson } from "./http";

export const createRoute = async (payload) => {
  const response = await fetch(`${API_URL}/routes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
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

export const getRoutes = async () => {
  const response = await fetch(`${API_URL}/routes`, {
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

  return Array.isArray(data?.routes) ? data.routes : [];
};
