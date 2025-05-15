import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HomePage from '../pages/public/HomePage/HomePage';
import LoginPage from '../pages/auth/LoginPage/LoginPage';
import UserRegistrationPage from '../pages/auth/registration/UserRegistrationPage';
import NotFoundPage from '../pages/public/NotFoundPage/NotFoundPage'; // Fixed path
import DashboardPage from '../pages/user/DashboardPage/DashboardPage';
import ProfilePage from '../pages/user/ProfilePage/ProfilePage';
import SearchPage from '../pages/user/SearchPage/SearchPage';
import TeamsPage from '../pages/user/TeamsPage/TeamsPage';
import CreateTeam from '../pages/user/TeamsPage/CreateTeam/CreateTeam';
import TeamSpace from '../pages/user/TeamsPage/TeamSpace/TeamSpace';
import TournamentPage from '../pages/user/TournamentPage/TournamentPage';
import TournamentDetailsPage from '../pages/user/TournamentDetailsPage/TournamentDetailsPage';
// Fix import path for AdminDashboard
import AdminDashboard from '../pages/admin/Dashboard/index.js';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';
import NewsPage from '../pages/user/NewsPage';
import AboutPage from '../pages/public/AboutPage';
import Settings from '../pages/user/TeamsPage/TeamSpace/pages/Settings/Settings';

// AuthRoute: Redirects to login if not authenticated
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading indicator while checking authentication
  if (loading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// AdminRoute: Redirects to dashboard if not admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, hasRole } = useAuth(); // Remove unused 'user' variable
  
  if (loading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return hasRole('admin') ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<UserRegistrationPage />} />
      <Route path="/about" element={<AboutPage />} />
      
      {/* Authenticated routes */}
      <Route element={
        <AuthRoute>
          <AuthenticatedLayout />
        </AuthRoute>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/create" element={<CreateTeam />} />
        <Route path="/teams/:id" element={<TeamSpace />} />
        <Route path="/teams/:teamId/space" element={<TeamSpace />} />
        <Route path="/teams/:teamId/space/*" element={<TeamSpace />} /> {/* Update the TeamSpace route to support nested routing */}
        {/* Add a separate route for settings */}
        <Route path="/teams/:teamId/settings" element={<Settings />} />
        <Route path="/tournaments" element={<TournamentPage />} />
        <Route path="/tournaments/:id" element={<TournamentDetailsPage />} />
        <Route path="/news" element={<NewsPage />} /> {/* Add the News route */}
      </Route>

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <AuthenticatedLayout>
            <AdminDashboard />
          </AuthenticatedLayout>
        </AdminRoute>
      } />
      
      {/* 404 page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
