import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../utils/api/client';

// Create context
export const ConnectionContext = createContext(null);

// Create a hook for easy access to the context
export const useConnection = () => useContext(ConnectionContext);

export function ConnectionProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [checking, setChecking] = useState(false);

  // Listen for online/offline events from the browser
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to check API availability
  const checkApiConnection = async (force = false) => {
    // Don't check if we're offline or already checking
    if (!isOnline || checking) return;
    
    // Don't check if we checked recently (within the last 10 seconds)
    if (lastChecked && !force) {
      const timeSinceLastCheck = Date.now() - lastChecked;
      if (timeSinceLastCheck < 10000) return;
    }

    setChecking(true);
    try {
      // Make a simple request to check API health
      await api.get('/api/health', { timeout: 5000 });
      setApiAvailable(true);
    } catch (error) {
      console.error('API connection check failed:', error);
      setApiAvailable(false);
    } finally {
      setLastChecked(Date.now());
      setChecking(false);
    }
  };

  // Check connection when user comes back online
  useEffect(() => {
    if (isOnline) {
      checkApiConnection(true);
    } else {
      setApiAvailable(false);
    }
  }, [isOnline]);

  // Periodic check for API availability (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      checkApiConnection();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Value provided by the context
  const value = {
    isOnline,
    apiAvailable,
    checkApiConnection,
    lastChecked,
    checking
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export default ConnectionProvider;
