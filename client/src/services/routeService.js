const API_URL = process.env.REACT_APP_API_URL;

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const createRoute = async (payload, token) => {
  const response = await fetch(`${API_URL}/routes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
};

export const getRoutes = async (token) => {
  const response = await fetch(`${API_URL}/routes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await parseJson(response);

  if (!response.ok) {
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return Array.isArray(data)
    ? data
    : Array.isArray(data?.routes)
    ? data.routes
    : Array.isArray(data?.data)
    ? data.data
    : [];
};
