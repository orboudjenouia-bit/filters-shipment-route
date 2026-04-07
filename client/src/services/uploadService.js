import API_URL, { getAuthToken, requestJson } from "./http";

export const uploadPhoto = async (file) => {
  if (!(file instanceof File)) {
    throw new Error("Please select a valid image file.");
  }

  const formData = new FormData();
  formData.append("photo", file);

  const data = await requestJson(
    `${API_URL}/uploads/photo`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    },
    { fallbackMessage: "Failed to upload photo", authAware: true }
  );

  return data?.data?.path || "";
};
