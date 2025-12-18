import { API_ENDPOINTS } from '@/config/api';
import { Client, Payment } from '@/types/gym';

// Generic fetch wrapper with error handling
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || error.error || 'Request failed');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Client API
export const clientApi = {
  register: async (clientData: Omit<Client, 'id' | 'clientId' | 'createdAt' | 'payments'>) => {
    return fetchApi<{ success: boolean; client: Client; message: string }>(
      API_ENDPOINTS.clients.register,
      {
        method: 'POST',
        body: JSON.stringify(clientData),
      }
    );
  },

  getAll: async () => {
    return fetchApi<Client[]>(API_ENDPOINTS.clients.getAll);
  },

  getById: async (clientId: string) => {
    return fetchApi<Client>(API_ENDPOINTS.clients.getById(clientId));
  },

  update: async (clientId: string, updates: Partial<Client>) => {
    return fetchApi<{ success: boolean; client: Client }>(API_ENDPOINTS.clients.getById(clientId), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  remove: async (clientId: string) => {
    return fetchApi<{ success: boolean; message: string }>(API_ENDPOINTS.clients.getById(clientId), {
      method: 'DELETE',
    });
  },
};

// Payment API
export const paymentApi = {
  create: async (paymentData: {
    clientId: string;
    amount: number;
    finalAmount: number;
    paidAmount: number;
    discount?: number;
    discountType?: string;
    notes?: string;
  }) => {
    return fetchApi<{ success: boolean; message: string }>(
      API_ENDPOINTS.payments.create,
      {
        method: 'POST',
        body: JSON.stringify(paymentData),
      }
    );
  },

  getByClientId: async (clientId: string) => {
    return fetchApi<Payment[]>(API_ENDPOINTS.payments.getByClientId(clientId));
  },
};

// Email API
export const emailApi = {
  send: async (data: {
    clientId: string;
    emailType: string;
    subject: string;
    html: string;
  }) => {
    return fetchApi<{ success: boolean; message: string }>(
      API_ENDPOINTS.emails.send,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  getHistory: async (clientId: string) => {
    return fetchApi<any[]>(API_ENDPOINTS.emails.getHistory(clientId));
  },
};

// Health check
export const healthCheck = async () => {
  return fetchApi<{ status: string }>(API_ENDPOINTS.health);
};
