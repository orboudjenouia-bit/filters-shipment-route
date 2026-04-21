import API_URL, { getAuthHeaders, requestJson } from "./http";

export const createShipment = async (payload) => {
  return requestJson(
    `${API_URL}/shipments`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    { fallbackMessage: "Failed to create shipment", authAware: true }
  );
};

export const getShipments = async () => {
  const data = await requestJson(
    `${API_URL}/shipments`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch shipments", authAware: true }
  );

  return Array.isArray(data?.shipments) ? data.shipments : [];
};

export const getMyShipments = async () => {
  const data = await requestJson(
    `${API_URL}/shipments/me`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch shipments", authAware: true }
  );

  return Array.isArray(data?.shipments) ? data.shipments : [];
};

export const updateShipment = async (payload) => {
  const data = await requestJson(
    `${API_URL}/shipments`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    { fallbackMessage: "Failed to update shipment", authAware: true }
  );

  return data?.data || data;
};

export const deleteShipment = async (shipmentId) => {
  return requestJson(
    `${API_URL}/shipments/${encodeURIComponent(String(shipmentId))}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to delete shipment", authAware: true }
  );
};
