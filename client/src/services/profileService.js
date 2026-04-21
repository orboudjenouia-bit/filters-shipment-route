import API_URL, { getAuthHeaders, requestJson } from "./http";

export const IndividualProfile = async ({ full_Name, nin, location, photo }) => {
  return requestJson(
    `${API_URL}/profile/individual`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ full_Name, nin, location, ...(photo ? { photo } : {}) }),
    },
    { fallbackMessage: "Failed to create individual profile", authAware: true }
  );
};

export const BusinessProfile = async ({
  business_Name,
  rc_Number,
  form,
  nif,
  nis,
  locations,
  photo,
}) => {
  return requestJson(
    `${API_URL}/profile/business`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ business_Name, rc_Number, form, nif, nis, locations, ...(photo ? { photo } : {}) }),
    },
    { fallbackMessage: "Failed to create business profile", authAware: true }
  );
};

export const getMyProfile = async () => {
  const data = await requestJson(
    `${API_URL}/profile/me`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch profile", authAware: true }
  );

  return data?.data || data;
};

export const getPublicProfile = async (userId) => {
  const data = await requestJson(
    `${API_URL}/profile/user/${encodeURIComponent(String(userId))}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch user profile", authAware: true }
  );

  return data?.data || data;
};

export const getShipmentHistory = async () => {
  return requestJson(
    `${API_URL}/profile/historyShipments`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch shipment history", authAware: true }
  );
};

export const getRouteHistory = async () => {
  return requestJson(
    `${API_URL}/profile/historyRoutes`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch route history", authAware: true }
  );
};

export const getVehicles = async () => {
  return requestJson(
    `${API_URL}/profile/vehicles`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch vehicles", authAware: true }
  );
};

export const updateMyProfile = async ({ user, profile }) => {
  const data = await requestJson(
    `${API_URL}/auth/update-profile`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ user, profile }),
    },
    { fallbackMessage: "Failed to update profile", authAware: true }
  );

  return data?.data || data;
};

export const createVehicle = async ({
  plate_Number,
  type,
  vehicle_Name,
  color,
  year,
  capacity,
  photo = null,
}) => {
  const data = await requestJson(
    `${API_URL}/profile/vehicles`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ plate_Number, type, vehicle_Name, color, year, capacity, photo }),
    },
    { fallbackMessage: "Failed to create vehicle", authAware: true }
  );

  return data?.vehicle || data;
};
