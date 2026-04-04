import API_URL, { getAuthHeaders, handleAuthFailure, parseJson } from "./http";

export const IndividualProfile = async ({ full_Name, nin, location }) => {
  const response = await fetch(`${API_URL}/profile/individual`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ full_Name, nin, location }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to create individual profile",
    };
  }

  return data;
};

export const BusinessProfile = async ({
  business_Name,
  rc_Number,
  form,
  nif,
  nis,
  locations,
}) => {
  const response = await fetch(`${API_URL}/profile/business`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ business_Name, rc_Number, form, nif, nis, locations }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to create business profile",
    };
  }

  return data;
};

export const getMyProfile = async () => {
  const response = await fetch(`${API_URL}/profile/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to fetch profile",
    };
  }

  return data?.data || data;
};

export const getShipmentHistory = async () => {
  const response = await fetch(`${API_URL}/profile/historyShipments`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to fetch shipment history",
    };
  }

  return data;
};

export const getRouteHistory = async () => {
  const response = await fetch(`${API_URL}/profile/historyRoutes`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to fetch route history",
    };
  }

  return data;
};

export const getVehicles = async () => {
  const response = await fetch(`${API_URL}/profile/vehicles`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to fetch vehicles",
    };
  }

  return data;
};

export const updateMyProfile = async ({ user, profile }) => {
  const response = await fetch(`${API_URL}/auth/update-profile`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ user, profile }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to update profile",
    };
  }

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
  const response = await fetch(`${API_URL}/profile/vehicles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ plate_Number, type, vehicle_Name, color, year, capacity, photo }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to create vehicle",
    };
  }

  return data?.vehicle || data;
};
