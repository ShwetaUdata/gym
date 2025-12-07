import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Payment } from '@/types/gym';

interface GymContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'clientId' | 'createdAt' | 'payments'>) => Client;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  deleteClient: (clientId: string) => void;
  getClientBySearch: (searchTerm: string) => Client[];
  getClientById: (clientId: string) => Client | undefined;
  addPayment: (clientId: string, payment: Omit<Payment, 'id' | 'clientId'>) => void;
  isAdminLoggedIn: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

const STORAGE_KEY = 'gym_clients';
const ADMIN_STORAGE_KEY = 'gym_admin_logged_in';

export function GymProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [nextId, setNextId] = useState(101);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedClients = JSON.parse(stored);
      setClients(parsedClients);
      if (parsedClients.length > 0) {
        const maxId = Math.max(...parsedClients.map((c: Client) => parseInt(c.clientId)));
        setNextId(maxId + 1);
      }
    }
    const adminStored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (adminStored === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  const addClient = (clientData: Omit<Client, 'id' | 'clientId' | 'createdAt' | 'payments'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: nextId,
      clientId: nextId.toString(),
      createdAt: new Date().toISOString(),
      payments: [],
    };
    setClients(prev => [...prev, newClient]);
    setNextId(prev => prev + 1);
    return newClient;
  };

  const updateClient = (clientId: string, updates: Partial<Client>) => {
    setClients(prev =>
      prev.map(client =>
        client.clientId === clientId ? { ...client, ...updates } : client
      )
    );
  };

  const deleteClient = (clientId: string) => {
    setClients(prev => prev.filter(client => client.clientId !== clientId));
  };

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

  const addPayment = (clientId: string, payment: Omit<Payment, 'id' | 'clientId'>) => {
    setClients(prev =>
      prev.map(client => {
        if (client.clientId === clientId) {
          const newPayment: Payment = {
            ...payment,
            id: (client.payments?.length || 0) + 1,
            clientId,
          };
          return {
            ...client,
            payments: [...(client.payments || []), newPayment],
          };
        }
        return client;
      })
    );
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
        addClient,
        updateClient,
        deleteClient,
        getClientBySearch,
        getClientById,
        addPayment,
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
