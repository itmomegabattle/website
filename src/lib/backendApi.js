export { BACKEND_API } from "./apiBase";
import { BACKEND_API } from "./apiBase";
export async function backendApi(path, options = {}) {
  const response = await fetch(`${BACKEND_API}${path}`, { credentials: "include", ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || data?.message || `Ошибка API ${response.status}`);
  return data;
}
