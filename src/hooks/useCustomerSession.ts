import { useState, useEffect, useCallback } from 'react';
import { CustomerMode } from '../types';

interface CustomerSession {
  name: string | null;
  phone: string | null;
  mode: CustomerMode | null;
  tableNumber: string | null;
}

const SESSION_KEY = 'dought_studio_customer_session';

export function useCustomerSession() {
  const [session, setSession] = useState<CustomerSession | null>(() => {
    const storedSession = sessionStorage.getItem(SESSION_KEY);
    return storedSession ? JSON.parse(storedSession) : null;
  });

  // ======================= PERBAIKAN UTAMA DI SINI =======================
  // Menggunakan "functional update" untuk mencegah "stale state".
  // Ini akan memastikan App.tsx menerima perubahan state dan melakukan re-render.
  const updateSession = useCallback((newSessionData: Partial<CustomerSession>) => {
    setSession(prevSession => {
      const newSession = { ...(prevSession || {}), ...newSessionData } as CustomerSession;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      return newSession;
    });
  }, []); // Dependensi bisa dikosongkan karena kita menggunakan prevSession
  // =======================================================================

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SESSION_KEY) {
        const storedSession = sessionStorage.getItem(SESSION_KEY);
        setSession(storedSession ? JSON.parse(storedSession) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    session,
    updateSession,
    clearSession,
    isSessionActive: !!session?.mode,
  };
}