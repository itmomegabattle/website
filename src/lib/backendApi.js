export const BACKEND_API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/+$/, "");
export async function backendApi(path, options = {}) {
  const token = sessionStorage.getItem("mb_session_token");
  const response = await fetch(`${BACKEND_API}${path}`, { credentials: "include", ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || data?.message || `Ошибка API ${response.status}`);
  return data;
}
