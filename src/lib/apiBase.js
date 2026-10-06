const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

export const BACKEND_API = configuredApiBase || (import.meta.env.PROD ? "/api/backend" : "http://localhost:4000");
