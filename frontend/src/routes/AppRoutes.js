import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/ui/Loading/Loading';
import ErrorBoundary from '../components/ErrorBoundary';

// Eagerly loaded components for critical routes
import HomePage from '../pages/public/HomePage';

// Lazy loaded components for other routes
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RoleSelectionPage = lazy(() => import('../pages/auth/RoleSelectionPage'));
const AthleteRegistrationPage = lazy(() => import('../pages/auth/registration/AthleteRegistrationPage'));
const DashboardPage = lazy(() => import('../pages/athlete/DashboardPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));

// Wrapper for protected routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading fullPage message="Loading content..." />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/role-selection" element={<RoleSelectionPage />} />
          <Route path="/register/athlete" element={<AthleteRegistrationPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
