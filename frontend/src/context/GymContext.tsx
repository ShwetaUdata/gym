// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
//   useCallback,
// } from "react";
// import { Client, Payment } from "@/types/gym";
// import { clientApi } from "@/services/apiService";
// // import { getAll } from '@/services/apiService';

// interface GymContextType {
//   clients: Client[];
//   loading: boolean;
//   refreshClients: () => Promise<void>;
//   updateClient: (clientId: string, updates: Partial<Client>) => Promise<void>;
//   deleteClient: (clientId: string) => Promise<void>;
//   getClientBySearch: (searchTerm: string) => Client[];
//   getClientById: (clientId: string) => Client | undefined;
//   isAdminLoggedIn: boolean;
//   adminLogin: (username: string, password: string) => boolean;
//   adminLogout: () => void;
// }

// const GymContext = createContext<GymContextType | undefined>(undefined);

// const ADMIN_STORAGE_KEY = "gym_admin_logged_in";

// export function GymProvider({ children }: { children: ReactNode }) {
//   const [clients, setClients] = useState<Client[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);

//   const refreshClients = useCallback(async () => {
//     try {
//       setLoading(true);

//       const fetchedClients = await clientApi.getAll();

//       setClients(Array.isArray(fetchedClients) ? fetchedClients : []);
//     } catch (error) {
//       console.error("Failed to fetch clients:", error);
//       setClients([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     refreshClients();
//     const adminStored = localStorage.getItem(ADMIN_STORAGE_KEY);
//     if (adminStored === "true") {
//       setIsAdminLoggedIn(true);
//     }
//   }, [refreshClients]);

//   useEffect(() => {
//     setIsAdmin(false); // Always reset on reload
//   }, []);

//   const updateClient = useCallback(
//     async (clientId: string, updates: Partial<Client>) => {
//       try {
//         await clientApi.update(clientId, updates);
//         await refreshClients();
//       } catch (error) {
//         console.error("Failed to update client:", error);
//       }
//     },
//     [refreshClients]
//   );

//   const deleteClient = useCallback(
//     async (clientId: string) => {
//       try {
//         await clientApi.remove(clientId);
//         await refreshClients();
//       } catch (error) {
//         console.error("Failed to delete client:", error);
//       }
//     },
//     [refreshClients]
//   );

//   const getClientBySearch = (searchTerm: string): Client[] => {
//     if (!searchTerm) return clients;
//     const term = searchTerm.toLowerCase();
//     return clients.filter(
//       (client) =>
//         client.name.toLowerCase().includes(term) ||
//         client.clientId.includes(term) ||
//         client.email.toLowerCase().includes(term) ||
//         client.mobile.includes(term)
//     );
//   };

//   const getClientById = (clientId: string): Client | undefined => {
//     return clients.find((client) => client.clientId === clientId);
//   };

//   const adminLogin = (user, pass) => {
//     if (user === "gymnasium" && pass === "usbv@7173") {
//       setIsAdmin(true);
//       return true;
//     }
//     return false;
//   };
//   const adminLogout = () => setIsAdmin(false);

//   return (
//     <GymContext.Provider
//       value={{
//         clients,
//         loading,
//         refreshClients,
//         updateClient,
//         deleteClient,
//         getClientBySearch,
//         getClientById,
//         isAdminLoggedIn,
//         adminLogin,
//         adminLogout,
//       }}
//     >
//       {children}
//     </GymContext.Provider>
//   );
// }

// export function useGym() {
//   const context = useContext(GymContext);
//   if (context === undefined) {
//     throw new Error("useGym must be used within a GymProvider");
//   }
//   return context;
// }
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Client } from "@/types/gym";
import { clientApi } from "@/services/apiService";

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

export function GymProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ SINGLE admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // ✅ Always reset admin on reload
  useEffect(() => {
    setIsAdminLoggedIn(false);
  }, []);

  const refreshClients = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedClients = await clientApi.getAll();
      setClients(Array.isArray(fetchedClients) ? fetchedClients : []);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  const updateClient = useCallback(
    async (clientId: string, updates: Partial<Client>) => {
      await clientApi.update(clientId, updates);
      await refreshClients();
    },
    [refreshClients]
  );

  const deleteClient = useCallback(
    async (clientId: string) => {
      await clientApi.remove(clientId);
      await refreshClients();
    },
    [refreshClients]
  );

  const getClientBySearch = (searchTerm: string): Client[] => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.clientId.includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.mobile.includes(term)
    );
  };

  const getClientById = (clientId: string) =>
    clients.find((c) => c.clientId === clientId);

  // ✅ LOGIN
  const adminLogin = (username: string, password: string) => {
    if (username === "gymnasium" && password === "usbv@7173") {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  // ✅ LOGOUT
  const adminLogout = () => {
    setIsAdminLoggedIn(false);
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
  if (!context) {
    throw new Error("useGym must be used within a GymProvider");
  }
  return context;
}
