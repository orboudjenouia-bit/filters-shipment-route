import API_URL, { getAuthHeaders, requestJson } from "./http";

export const getNotifications = async () => {
  const data = await requestJson(
    `${API_URL}/notifications/all`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to load notifications", authAware: true }
  );

  return Array.isArray(data?.data) ? data.data : [];
};

export const createNotification = async (payload) => {
  return requestJson(
    `${API_URL}/notifications`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    { fallbackMessage: "Failed to create notification", authAware: true }
  );
};

export const deleteNotification = async (notificationId) => {
  return requestJson(
    `${API_URL}/notifications/${notificationId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to delete notification", authAware: true }
  );
};

export const markNotificationAsRead = async (notificationId) => {
  const data = await requestJson(
    `${API_URL}/notifications/${notificationId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to read notification", authAware: true }
  );

  return data?.data;
};

export const markAllNotificationsAsRead = async () => {
  return requestJson(
    `${API_URL}/notifications/read-all`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to update notifications", authAware: true }
  );
};

export const markManyNotificationsAsRead = async (ids) => {
  return requestJson(
    `${API_URL}/notifications/read-many`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids }),
    },
    { fallbackMessage: "Failed to update notifications", authAware: true }
  );
};
