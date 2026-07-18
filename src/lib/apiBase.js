export const BACKEND_API = import.meta.env.PROD
  ? "/api/backend"
  : (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/+$/, "");
