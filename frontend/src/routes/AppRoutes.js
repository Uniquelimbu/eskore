import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import UserRegistrationPage from '../pages/auth/registration/UserRegistrationPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// User Pages
import DashboardPage from '../pages/user/DashboardPage';
import ProfilePage from '../pages/user/ProfilePage';
import SearchPage from '../pages/user/SearchPage';
import LeaderboardPage from '../pages/user/LeaderboardPage';
import TeamsPage from '../pages/user/TeamsPage';
import TeamDetailsPage from '../pages/user/TeamDetailsPage';
import TournamentPage from '../pages/user/TournamentPage';
import TournamentDetailsPage from '../pages/user/TournamentDetailsPage';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<UserRegistrationPage />} />

      {/* User Routes (Protected) */}
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

      {/* Admin routes - using ProtectedRoute for now since roles are not important */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
