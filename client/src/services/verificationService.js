const API_URL = process.env.REACT_APP_API_URL;

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export const verifyCode = async (code) => {
  const response = await fetch(`${API_URL}/check-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || "Verification failed",
    };
  }

  return data;
};
