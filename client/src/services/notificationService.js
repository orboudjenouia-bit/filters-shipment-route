import API_URL, { getAuthHeaders, handleAuthFailure, parseJson } from "./http";

export const getNotifications = async () => {
  const response = await fetch(`${API_URL}/notifications/all`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return Array.isArray(data?.data) ? data.data : [];
};

export const createNotification = async (payload) => {
  const response = await fetch(`${API_URL}/notifications`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
};

export const deleteNotification = async (notificationId) => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data?.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
};

export const markManyNotificationsAsRead = async (ids) => {
  const response = await fetch(`${API_URL}/notifications/read-many`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    const error = new Error(data.message || `Server error: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return data;
};
