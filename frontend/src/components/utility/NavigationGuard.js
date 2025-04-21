import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext'; // Corrected path

/**
 * Navigation guard component to handle protected routes and redirects
 */
export function NavigationGuard() {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip checks if auth isn't initialized or is still loading
    if (!initialized || loading) return;

    // Protected paths that require authentication
    const protectedPaths = ['/profile', '/settings', '/athlete/home'];
    
    // Paths that should redirect authenticated users (like login page)
    const authRedirectPaths = ['/login', '/register', '/role-selection'];
    
    // Check if current path requires authentication
    const isProtectedPath = protectedPaths.some(path => 
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
    
    // Check if current path should redirect authenticated users
    const isAuthRedirectPath = authRedirectPaths.some(path => 
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );

    // Redirect ONLY if trying to access protected path without authentication
    if (isProtectedPath && !user) {
      navigate('/login', { state: { from: location.pathname } });
    }
    
    // Redirect if trying to access auth pages while authenticated
    if (isAuthRedirectPath && user) {
      navigate('/profile');
    }
    
    // Never redirect from the homepage
    if (location.pathname === '/') {
      return;
    }
  }, [user, loading, initialized, location.pathname, navigate]);
  
  return null;
}
