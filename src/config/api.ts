// API Configuration for Express Backend
// Set VITE_API_URL in .env for production, defaults to localhost:5000 for dev

const envBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

export const API_BASE_URL = envBaseUrl || "http://localhost:5000";

const withBase = (path: string) => `${API_BASE_URL}${path}`;

export const API_ENDPOINTS = {
  // Client endpoints
  clients: {
    register: withBase("/api/clients/register"),
    getAll: withBase("/api/clients"),
    getById: (id: string) => withBase(`/api/clients/${id}`),
  },
  // Payment endpoints
  payments: {
    create: withBase("/api/payments"),
    getByClientId: (id: string) => withBase(`/api/payments/${id}`),
  },
  // Email endpoints
  emails: {
    send: withBase("/api/emails/send"),
    getHistory: (id: string) => withBase(`/api/emails/${id}`),
  },
  // Health check
  health: withBase("/api/health"),
};

