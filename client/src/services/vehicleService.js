import API_URL, { getAuthHeaders, requestJson } from "./http";

export const addVehicle = async (payload) => {
  return requestJson(
    `${API_URL}/vehicles`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    { fallbackMessage: "Failed to add vehicle", authAware: true }
  );
};

export const getVehicles = async () => {
  const data = await requestJson(
    `${API_URL}/vehicles`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch vehicles", authAware: true }
  );

  return Array.isArray(data?.vehicles) ? data.vehicles : [];
};

export const updateVehicle = async (payload) => {
  const data = await requestJson(
    `${API_URL}/vehicles`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    { fallbackMessage: "Failed to update vehicle", authAware: true }
  );

  return data;
};

export const deleteVehicle = async (vehicleId) => {
  return requestJson(
    `${API_URL}/vehicles/${vehicleId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to delete vehicle", authAware: true }
  );
};