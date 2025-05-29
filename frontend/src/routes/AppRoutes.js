import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HomePage from '../pages/public/HomePage/HomePage';
import LoginPage from '../pages/auth/LoginPage/LoginPage';
import UserRegistrationPage from '../pages/auth/registration/UserRegistrationPage';
import NotFoundPage from '../pages/public/NotFoundPage/NotFoundPage'; 
import DashboardPage from '../pages/user/DashboardPage/DashboardPage';
import ProfilePage from '../pages/user/ProfilePage/ProfilePage';
import SearchPage from '../pages/user/SearchPage/SearchPage';
import TeamsPage from '../pages/user/TeamsPage/TeamsPage';
import CreateTeam from '../pages/user/TeamsPage/CreateTeam/CreateTeam';
import TournamentPage from '../pages/user/TournamentPage/TournamentPage';
import TournamentDetailsPage from '../pages/user/TournamentDetailsPage/TournamentDetailsPage';
import AdminDashboard from '../pages/admin/Dashboard/index.js';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';
import NewsPage from '../pages/user/NewsPage';
import AboutPage from '../pages/public/AboutPage';
import TeamSpace from '../pages/user/TeamsPage/TeamSpace/TeamSpace'; 
import Settings from '../pages/user/TeamsPage/TeamSpace/pages/Settings/Settings'; 
import Squad from '../pages/user/TeamsPage/TeamSpace/pages/Squad/Squad'; 
import Formation from '../pages/user/TeamsPage/TeamSpace/pages/Formation/Formation'; 
import Calendar from '../pages/user/TeamsPage/TeamSpace/pages/Calendar/Calendar';
import EditProfilePage from '../pages/user/ProfilePage/components/Edit/EditProfilePage.js';
import TeamOverviewPage from '../pages/user/TeamsPage/JoinTeam/TeamOverviewPage'; // Fixed import path

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
        <Route path="/profile/edit" element={<EditProfilePage />} /> {/* Add the new route for editing profile */}
        <Route path="/search" element={<SearchPage />} />
        
        {/* Team related routes */}
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/create" element={<CreateTeam />} />
        
        {/* TeamSpace and its nested child routes */}
        <Route path="/teams/:teamId/space" element={<TeamSpace />}>
          {/* Default child can be set here if needed, e.g., redirect to squad */}
          {/* <Route index element={<Navigate to="squad" replace />} /> */}
          <Route path="squad" element={<Squad />} />
          <Route path="formation" element={<Formation />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="/tournaments" element={<TournamentPage />} />
        <Route path="/tournaments/:id" element={<TournamentDetailsPage />} />
        <Route path="/news" element={<NewsPage />} /> {/* Add the News route */}
        
        {/* Add the TeamOverviewPage route */}
        <Route path="/team-overview/:teamId" element={<TeamOverviewPage />} />
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
