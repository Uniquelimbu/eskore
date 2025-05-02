import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Public pages
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import LoginPage from '../pages/auth/LoginPage';
// Update this import to use the UserRegistrationPage (3-step form)
import RegistrationPage from '../pages/auth/registration/UserRegistrationPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// User pages
import DashboardPage from '../pages/user/DashboardPage';
import ProfilePage from '../pages/user/ProfilePage';
import SearchPage from '../pages/user/SearchPage';
import LeaderboardPage from '../pages/user/LeaderboardPage';
import TeamsPage from '../pages/user/TeamsPage';
import TeamDetailsPage from '../pages/user/TeamDetailsPage';
import TournamentPage from '../pages/user/TournamentPage';
import TournamentDetailsPage from '../pages/user/TournamentDetailsPage';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard';

// Protected route component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegistrationPage />} />

    {/* User routes - require authentication */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    } />
    <Route path="/profile" element={
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    } />
    <Route path="/search" element={
      <ProtectedRoute>
        <SearchPage />
      </ProtectedRoute>
    } />
    <Route path="/leaderboards" element={
      <ProtectedRoute>
        <LeaderboardPage />
      </ProtectedRoute>
    } />

    {/* Team routes */}
    <Route path="/teams" element={
      <ProtectedRoute>
        <TeamsPage />
      </ProtectedRoute>
    } />
    <Route path="/teams/:id" element={
      <ProtectedRoute>
        <TeamDetailsPage />
      </ProtectedRoute>
    } />

    {/* Tournament routes */}
    <Route path="/tournaments" element={
      <ProtectedRoute>
        <TournamentPage />
      </ProtectedRoute>
    } />
    <Route path="/tournaments/:id" element={
      <ProtectedRoute>
        <TournamentDetailsPage />
      </ProtectedRoute>
    } />

    {/* Admin routes */}
    <Route path="/admin/dashboard" element={
      <ProtectedRoute roles={['admin', 'athlete_admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    } />

    {/* 404 */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
