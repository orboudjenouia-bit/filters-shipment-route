import API_URL, { getAuthHeaders, requestJson } from "./http";

export const createRoute = async (payload) => {
  return requestJson(
    `${API_URL}/routes`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    { fallbackMessage: "Failed to create route", authAware: true }
  );
};

export const getRoutes = async () => {
  const data = await requestJson(
    `${API_URL}/routes`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch routes", authAware: true }
  );

  return Array.isArray(data?.routes) ? data.routes : [];
};

export const getMyRoutes = async () => {
  const data = await requestJson(
    `${API_URL}/routes/me`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch routes", authAware: true }
  );

  return Array.isArray(data?.routes) ? data.routes : [];
};

export const updateRoute = async (payload) => {
  const data = await requestJson(
    `${API_URL}/routes`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    { fallbackMessage: "Failed to update route", authAware: true }
  );

  return data?.data || data;
};

export const deleteRoute = async (routeId) => {
  return requestJson(
    `${API_URL}/routes/${encodeURIComponent(String(routeId))}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to delete route", authAware: true }
  );
};
