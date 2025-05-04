import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute component
 * Ensures that only authenticated users can access the wrapped routes
 * Redirects unauthenticated users to the login page
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state if authentication is still being checked
  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    // Save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
