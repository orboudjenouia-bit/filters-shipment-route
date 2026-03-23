const API_URL = process.env.REACT_APP_API_URL;

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const createShipment = async (payload, token) => {
  const response = await fetch(`${API_URL}/shipments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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

export const getShipments = async (token) => {
  const response = await fetch(`${API_URL}/shipments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || `Server error: ${response.status}`,
    };
  }

  return Array.isArray(data)
    ? data
    : Array.isArray(data?.shipments)
    ? data.shipments
    : Array.isArray(data?.data)
    ? data.data
    : [];
};
