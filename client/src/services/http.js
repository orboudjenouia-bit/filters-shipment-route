const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw { status: 401, code: "NO_TOKEN", message: "Please login first." };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export default API_URL;