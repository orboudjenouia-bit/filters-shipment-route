import API_URL, { getAuthHeaders, requestJson } from "./http";

export const listSubscriptions = async () => {
  const data = await requestJson(
    `${API_URL}/subscriptions`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to list subscriptions", authAware: true }
  );

  return {
    subs: Array.isArray(data?.subs) ? data.subs : [],
    total: Number(data?.total ?? 0),
  };
};

export const getSubscriptionById = async (subId) => {
  return requestJson(
    `${API_URL}/subscriptions/${encodeURIComponent(String(subId))}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch subscription", authAware: true }
  );
};

export const getMySubscription = async () => {
  return requestJson(
    `${API_URL}/subscriptions/me`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to fetch current subscription", authAware: true }
  );
};

export const createSubscription = async (payload) => {
  return requestJson(
    `${API_URL}/subscriptions`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    { fallbackMessage: "Failed to create subscription", authAware: true }
  );
};

export const updateSubscription = async (subId, payload) => {
  return requestJson(
    `${API_URL}/subscriptions/${encodeURIComponent(String(subId))}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    { fallbackMessage: "Failed to update subscription", authAware: true }
  );
};

export const deleteSubscription = async (subId) => {
  return requestJson(
    `${API_URL}/subscriptions/${encodeURIComponent(String(subId))}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
    { fallbackMessage: "Failed to delete subscription", authAware: true }
  );
};
