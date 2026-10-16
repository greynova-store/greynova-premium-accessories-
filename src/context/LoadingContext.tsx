import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface LoadingContextValue {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  loadingMessage?: string;
}

const LoadingContext = createContext<LoadingContextValue>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);
  const timeoutRef = useRef<number | null>(null);

  const stopLoading = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
    setLoadingMessage(undefined);
  }, []);

  const startLoading = useCallback((message?: string) => {
    // Clear any previous timer
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setIsLoading(true);
    setLoadingMessage(message);

    // Safety timeout: never block interface indefinitely (max 10s safety fallback)
    timeoutRef.current = window.setTimeout(() => {
      stopLoading();
    }, 10000);
  }, [stopLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, loadingMessage }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
