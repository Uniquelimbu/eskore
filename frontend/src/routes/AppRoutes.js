import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/ui/Loading/Loading';
import ErrorBoundary from '../components/ErrorBoundary';

// Eagerly loaded components for critical routes
import HomePage from '../pages/public/HomePage';

// Lazy loaded components for other routes
const LoginPage = lazy(() => import('../pages/auth/LoginPage/LoginPage'));
const RoleSelectionPage = lazy(() => import('../pages/auth/RoleSelectionPage'));
const AthleteRegistrationPage = lazy(() => import('../pages/auth/registration/AthleteRegistrationPage'));
const DashboardPage = lazy(() => import('../pages/athlete/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/athlete/ProfilePage'));
const SearchPage = lazy(() => import('../pages/athlete/SearchPage')); // Add SearchPage import
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
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/role-selection" element={<RoleSelectionPage />} />
          <Route path="/register/athlete" element={<AthleteRegistrationPage />} />
          {/* Add other public routes like /features, /pricing, etc. if needed */}

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          {/* Add other protected routes like /practice, /leaderboards, etc. */}

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
