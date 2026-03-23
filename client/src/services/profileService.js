const API_URL = process.env.REACT_APP_API_URL;

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw { status: 401, code: "NO_TOKEN", message: "Please login first." };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const IndividualProfile = async ({ full_Name, nin, location }) => {
  const response = await fetch(`${API_URL}/profile/individual`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ full_Name, nin, location }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
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
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to create business profile",
    };
  }

  return data;
};

export const getMyProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw { status: 401, code: "NO_TOKEN", message: "Please login first." };
  }

  const response = await fetch(`${API_URL}/profile/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw {
      status: response.status,
      code: data.code,
      message: data.message || "Failed to fetch profile",
    };
  }

  return data?.data || data;
};
