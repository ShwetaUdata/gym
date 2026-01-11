// API Configuration for Express Backend
// In development: use Vite proxy (/api -> backend) to avoid CORS
// In production: use VITE_API_URL or fallback to hosted backend

const isDevelopment = import.meta.env.DEV;
const envBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

// In dev, keep base empty so requests go to /api/* and Vite proxies them.
export const API_BASE_URL =
  isDevelopment ? "" : envBaseUrl || "http://localhost:5000";

const normalize = (path: string) => path.replace(/\/+/g, "/");

const withBase = (path: string) =>
  normalize(`${API_BASE_URL}${path}`);

export const API_ENDPOINTS = {
  clients: {
    register: withBase("/api/clients/register"),
    getAll: withBase("/api/clients"),
    getById: (id: string) => withBase(`/api/clients/${id}`),
  },
  payments: {
    create: withBase("/api/payments"),
    getByClientId: (id: string) => withBase(`/api/payments/${id}`),
  },
  emails: {
    send: withBase("/api/emails/send"),
    getHistory: (id: string) => withBase(`/api/emails/${id}`),
  },
  health: withBase("/api/health"),
};

