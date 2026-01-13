// API Configuration for Express Backend
// In development: use Vite proxy (/api -> backend) to avoid CORS
// In production: use VITE_API_URL or fallback to local Electron backend

const isDevelopment = import.meta.env.DEV;
const envBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

// Check if running in Electron (file:// protocol or electron in user agent)
const isElectron = typeof window !== 'undefined' && (
  window.location.protocol === 'file:' ||
  navigator.userAgent.toLowerCase().includes('electron')
);

// In dev, keep base empty so requests go to /api/* and Vite proxies them.
// In Electron, use localhost:5000 since backend runs locally
// In hosted production, use Railway URL
export const API_BASE_URL =
  isDevelopment ? "" : 
  isElectron ? "http://localhost:5000" :
  envBaseUrl || "https://work-backend-production-be8c.up.railway.app";

const withBase = (path: string) => `${API_BASE_URL}${path}`;

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

