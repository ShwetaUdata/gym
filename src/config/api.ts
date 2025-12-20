// API Configuration for Express Backend
// For Lovable preview, uses Railway backend. For local dev, set VITE_API_URL=http://localhost:5000

const envBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

// Default to Railway backend for Lovable preview environment
export const API_BASE_URL = envBaseUrl || "https://work-backend-production-be8c.up.railway.app";

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

