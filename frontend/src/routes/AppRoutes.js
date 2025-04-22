import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/public/HomePage';
import RoleSelectionPage from '../pages/auth/RoleSelectionPage';
import LoginPage from '../pages/auth/LoginPage/LoginPage';
import AthleteRegistrationPage from '../pages/auth/registration/AthleteRegistrationPage';
import DashboardPage from '../pages/athlete/DashboardPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import { useAuth } from '../contexts/AuthContext';

// Protected route component that uses the auth context
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading indicator while checking auth status
  if (loading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Verifying authentication...</p>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/role-selection" element={<RoleSelectionPage />} />
      <Route path="/register/athlete" element={<AthleteRegistrationPage />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      {/* 404 route - replace the fallback route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
