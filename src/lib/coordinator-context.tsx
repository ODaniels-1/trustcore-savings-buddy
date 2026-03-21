import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Coordinator {
  id: string;
  full_name: string;
  group_name: string;
  location: string;
  weekly_contribution_amount: number;
  phone_number: string;
}

interface CoordinatorContextType {
  coordinator: Coordinator | null;
  setCoordinator: (c: Coordinator | null) => void;
  logout: () => void;
}

const CoordinatorContext = createContext<CoordinatorContextType>({
  coordinator: null,
  setCoordinator: () => {},
  logout: () => {},
});

export const useCoordinator = () => useContext(CoordinatorContext);

export const CoordinatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coordinator, setCoordinatorState] = useState<Coordinator | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('trustcore_coordinator');
    if (stored) {
      try {
        setCoordinatorState(JSON.parse(stored));
      } catch {
        localStorage.removeItem('trustcore_coordinator');
      }
    }
  }, []);

  const setCoordinator = (c: Coordinator | null) => {
    setCoordinatorState(c);
    if (c) {
      localStorage.setItem('trustcore_coordinator', JSON.stringify(c));
    } else {
      localStorage.removeItem('trustcore_coordinator');
    }
  };

  const logout = () => {
    setCoordinator(null);
  };

  return (
    <CoordinatorContext.Provider value={{ coordinator, setCoordinator, logout }}>
      {children}
    </CoordinatorContext.Provider>
  );
};
