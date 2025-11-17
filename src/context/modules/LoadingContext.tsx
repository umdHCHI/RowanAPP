// Manages global loading and error state

import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface LoadingContextType {
  isLoading: boolean;
  error: string | null;

  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const value: LoadingContextType = {
    isLoading,
    error,
    setIsLoading,
    setError,
    clearError,
  };

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};
