import API_URL, { getAuthHeaders, parseJson } from "./http";

export const createShipment = async (payload) => {
  const response = await fetch(`${API_URL}/shipments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || `Server error: ${response.status}`,
    };
  }

  return data;
};

export const getShipments = async () => {
  const response = await fetch(`${API_URL}/shipments`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || `Server error: ${response.status}`,
    };
  }

  return Array.isArray(data?.shipments) ? data.shipments : [];
};
