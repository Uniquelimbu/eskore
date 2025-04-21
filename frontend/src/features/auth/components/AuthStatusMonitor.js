import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/authApi';

/**
 * Invisible component that periodically checks authentication status
 * with the server to ensure the token is still valid
 */
function AuthStatusMonitor() {
  const { user, logout } = useAuth();
  const [lastChecked, setLastChecked] = useState(null);
  
  // Verify token validity every 5 minutes
  useEffect(() => {
    if (!user) return;
    
    const verifyAuth = async () => {
      try {
        // Check with the backend
        await authAPI.me();
        setLastChecked(new Date());
      } catch (error) {
        // If 401 Unauthorized or 403 Forbidden, token is invalid
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.warn('Session expired or invalid. Logging out.');
          // Trigger logout
          logout();
        }
      }
    };
    
    // Initial check
    verifyAuth();
    
    // Set up periodic checks
    const interval = setInterval(verifyAuth, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [user, logout]);
  
  // This component doesn't render anything
  return null;
}

export default AuthStatusMonitor;
