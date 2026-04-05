import API_URL, { getAuthHeaders, handleAuthFailure, parseJson } from "./http";

export const createShipment = async (payload) => {
  const response = await fetch(`${API_URL}/shipments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
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
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      message: data.message || `Server error: ${response.status}`,
    };
  }

  return Array.isArray(data?.shipments) ? data.shipments : [];
};

export const getMyShipments = async () => {
  const response = await fetch(`${API_URL}/shipments/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      message: data.message || `Server error: ${response.status}`,
    };
  }

  return Array.isArray(data?.shipments) ? data.shipments : [];
};

export const updateShipment = async (payload) => {
  const response = await fetch(`${API_URL}/shipments`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      message: data.message || `Server error: ${response.status}`,
    };
  }

  return data?.data || data;
};

export const deleteShipment = async (shipmentId) => {
  const response = await fetch(`${API_URL}/shipments/${encodeURIComponent(String(shipmentId))}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw {
      status: response.status,
      message: data.message || `Server error: ${response.status}`,
    };
  }

  return data;
};
