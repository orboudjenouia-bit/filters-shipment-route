import { API_BASE_URL } from "../services/http";

export const resolveMediaUrl = (value) => {
  const raw = String(value || "").trim();

  if (!raw) return "";
  if (raw.startsWith("data:")) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `http:${raw}`;

  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_BASE_URL}${normalized}`;
};
