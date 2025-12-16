// API Configuration for Express Backend
// Update this URL when deploying to production

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Client endpoints
  clients: {
    register: `${API_BASE_URL}/api/clients/register`,
    getAll: `${API_BASE_URL}/api/clients`,
    getById: (id: string) => `${API_BASE_URL}/api/clients/${id}`,
  },
  // Payment endpoints
  payments: {
    create: `${API_BASE_URL}/api/payments`,
    getByClientId: (id: string) => `${API_BASE_URL}/api/payments/${id}`,
  },
  // Email endpoints
  emails: {
    send: `${API_BASE_URL}/api/emails/send`,
    getHistory: (id: string) => `${API_BASE_URL}/api/emails/${id}`,
  },
  // Health check
  health: `${API_BASE_URL}/api/health`,
};
