import { useState, useCallback, useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';

export const useApi = (options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // For tracking mounted state to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Track if any request is currently active
  const activeRequestRef = useRef(null);
  
  // Add request deduplication
  const pendingRequests = useRef(new Map());
  
  // Optional auto-retry and caching settings
  const { 
    autoRetry = false, 
    maxRetries = 2, 
    retryDelay = 1000,
    cacheTime = 5 * 60 * 1000 // 5 minutes default cache time
  } = options;

  useEffect(() => {
    return () => {
      // When component unmounts, we set isMounted to false
      isMounted.current = false;
      
      // Cancel any active request if possible
      if (activeRequestRef.current) {
        activeRequestRef.current.cancel && activeRequestRef.current.cancel();
      }
      
      // Clear pending requests
      pendingRequests.current.clear();
    };
  }, []);

  const handleRequest = useCallback(async (method, url, payload = null, config = {}) => {
    if (!isMounted.current) return;
    
    // Create a request key for deduplication
    const requestKey = `${method.toUpperCase()}:${url}:${JSON.stringify(payload)}`;
    
    // Check if the same request is already pending
    if (pendingRequests.current.has(requestKey)) {
      console.log('Deduplicating request:', requestKey);
      return pendingRequests.current.get(requestKey);
    }
    
    // Reset state
    setLoading(true);
    setError(null);
    
    // Track this request
    const requestId = Symbol();
    activeRequestRef.current = requestId;
    
    const requestPromise = (async () => {
      try {
        // Configure caching options for GET requests
        if (method.toLowerCase() === 'get') {
          config.cache = {
            ...config.cache,
            useCache: true,
            maxAge: cacheTime
          };
        }
        
        // Make the request using the apiClient
        const response = await apiClient[method.toLowerCase()](url, 
          method.toLowerCase() === 'get' ? config : payload, 
          method.toLowerCase() !== 'get' ? config : undefined
        );
        
        // Only update state if this is still the active request and component is mounted
        if (activeRequestRef.current === requestId && isMounted.current) {
          setData(response);
          setLoading(false);
        }
        
        return response;
      } catch (err) {
        // If this request is no longer active or component unmounted, don't update state
        if (activeRequestRef.current !== requestId || !isMounted.current) {
          return;
        }
        
        // For auto-retry with network errors
        if (autoRetry && 
            err.status && 
            (err.status === 'NETWORK_ERROR' || err.status === 'OFFLINE' || 
             (err.status >= 500 && err.status < 600))) {
          
          let retryCount = 0;
          let lastError = err;
          
          while (retryCount < maxRetries) {
            try {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
              
              // If no longer mounted or request changed, abort retry
              if (!isMounted.current || activeRequestRef.current !== requestId) {
                return;
              }
              
              // Try again
              const response = await apiClient[method.toLowerCase()](url, 
                method.toLowerCase() === 'get' ? config : payload, 
                method.toLowerCase() !== 'get' ? config : undefined
              );
              
              // Success on retry
              if (isMounted.current && activeRequestRef.current === requestId) {
                setData(response);
                setLoading(false);
              }
              
              return response;
            } catch (retryError) {
              lastError = retryError;
              retryCount++;
            }
          }
          
          // All retries failed
          if (isMounted.current && activeRequestRef.current === requestId) {
            setError(lastError);
            setLoading(false);
          }
        } else {
          // For other errors, just set the error state
          if (isMounted.current && activeRequestRef.current === requestId) {
            setError(err);
            setLoading(false);
          }
        }
      } finally {
        // Remove from pending requests
        pendingRequests.current.delete(requestKey);
      }
    })();
    
    // Store the promise in the pending requests map for deduplication
    pendingRequests.current.set(requestKey, requestPromise);
    
    return requestPromise;
  }, [autoRetry, maxRetries, retryDelay, cacheTime]);

  // Expose the API methods and state
  return {
    loading,
    error,
    data,
    setData, // Allow manual updates to the data
    clearError: () => setError(null),
    get: (url, config) => handleRequest('get', url, null, config),
    post: (url, data, config) => handleRequest('post', url, data, config),
    put: (url, data, config) => handleRequest('put', url, data, config),
    patch: (url, data, config) => handleRequest('patch', url, data, config),
    delete: (url, config) => handleRequest('delete', url, null, config),
    // Helper to invalidate cache for specific URLs
    invalidateCache: (url) => apiClient.clearCache(url)
  };
};

// Create a hook for resource loading with auto-fetch
export const useResource = (url, options = {}) => {
  const { 
    initialFetch = true,
    dependencies = [], 
    ...apiOptions 
  } = options;
  
  const api = useApi(apiOptions);
  
  // Auto-fetch on mount or when dependencies change
  useEffect(() => {
    if (initialFetch && url) {
      api.get(url);
    }
  }, [url, initialFetch, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return api;
};
