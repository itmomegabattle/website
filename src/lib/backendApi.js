export { BACKEND_API } from "./apiBase";
import { BACKEND_API } from "./apiBase";

export async function backendApi(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined && options.body !== null;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  // Fastify rejects an empty DELETE request when it is labelled as JSON.
  // Only advertise JSON when a request actually contains a JSON body.
  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BACKEND_API}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || data?.message || `Ошибка API ${response.status}`);
  return data;
}
