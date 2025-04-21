import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext'; // Corrected path
import { ROLES } from '../../constants'; // Corrected path
import LoadingSpinner from '../feedback/LoadingSpinner'; // Corrected path

/**
 * A wrapper for routes that require authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @param {Array<string>} [props.roles] - Optional array of roles required to access the route
 */
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner text="Loading authentication..." />;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user has required role
  const isAllowed = roles ? 
    (roles.includes(user.role) || 
     // Allow admins to access any route
     user.role === ROLES.ADMIN || 
     user.role === ROLES.ATHLETE_ADMIN) : 
    true;
  
  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

export default ProtectedRoute;