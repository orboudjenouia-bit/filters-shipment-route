import API_URL, { getAuthHeaders, handleAuthFailure, parseJson } from "./http";

const buildError = (response, data, fallbackMessage) => {
  const error = new Error(data?.message || fallbackMessage || `Server error: ${response.status}`);
  error.status = response?.status;
  error.code = data?.code;
  return error;
};

export const listSubscriptions = async () => {
  const response = await fetch(`${API_URL}/subscriptions`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw buildError(response, data, "Failed to list subscriptions");
  }

  return {
    subs: Array.isArray(data?.subs) ? data.subs : [],
    total: Number(data?.total ?? 0),
  };
};

export const getSubscriptionById = async (subId) => {
  const response = await fetch(`${API_URL}/subscriptions/${encodeURIComponent(String(subId))}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw buildError(response, data, "Failed to fetch subscription");
  }

  return data;
};

export const getMySubscription = async () => {
  const response = await fetch(`${API_URL}/subscriptions/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw buildError(response, data, "Failed to fetch current subscription");
  }

  return data;
};

export const createSubscription = async (payload) => {
  const response = await fetch(`${API_URL}/subscriptions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw buildError(response, data, "Failed to create subscription");
  }

  return data;
};

export const updateSubscription = async (subId, payload) => {
  const response = await fetch(`${API_URL}/subscriptions/${encodeURIComponent(String(subId))}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw buildError(response, data, "Failed to update subscription");
  }

  return data;
};

export const deleteSubscription = async (subId) => {
  const response = await fetch(`${API_URL}/subscriptions/${encodeURIComponent(String(subId))}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    handleAuthFailure(response, data);
    throw buildError(response, data, "Failed to delete subscription");
  }

  return data;
};
