import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Client, Payment } from '@/types/gym';
import { clientApi } from '@/services/apiService';

interface GymContextType {
  clients: Client[];
  loading: boolean;
  refreshClients: () => Promise<void>;
  updateClient: (clientId: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  getClientBySearch: (searchTerm: string) => Client[];
  getClientById: (clientId: string) => Client | undefined;
  isAdminLoggedIn: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'gym_admin_logged_in';

export function GymProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const refreshClients = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedClients = await clientApi.getAll();
      setClients(fetchedClients);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      // Fallback to empty array on error
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshClients();
    const adminStored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (adminStored === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, [refreshClients]);

  const updateClient = useCallback(async (clientId: string, updates: Partial<Client>) => {
    try {
      await clientApi.update(clientId, updates);
      await refreshClients();
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  }, [refreshClients]);

  const deleteClient = useCallback(async (clientId: string) => {
    try {
      await clientApi.remove(clientId);
      await refreshClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  }, [refreshClients]);

  const getClientBySearch = (searchTerm: string): Client[] => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(
      client =>
        client.name.toLowerCase().includes(term) ||
        client.clientId.includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.mobile.includes(term)
    );
  };

  const getClientById = (clientId: string): Client | undefined => {
    return clients.find(client => client.clientId === clientId);
  };

  const adminLogin = (username: string, password: string): boolean => {
    if (username === 'gymnasium' && password === 'usbv7173') {
      setIsAdminLoggedIn(true);
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  return (
    <GymContext.Provider
      value={{
        clients,
        loading,
        refreshClients,
        updateClient,
        deleteClient,
        getClientBySearch,
        getClientById,
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
}
