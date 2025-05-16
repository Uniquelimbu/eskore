import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';
import DashboardPage from '../pages/user/DashboardPage/DashboardPage';
import SearchPage from '../pages/user/SearchPage/SearchPage';
import TeamsPage from '../pages/user/TeamsPage/TeamsPage';
import TeamSpace from '../pages/user/TeamsPage/TeamSpace/TeamSpace';
import CreateTeam from '../pages/user/TeamsPage/CreateTeam/CreateTeam';
import JoinTeam from '../pages/user/TeamsPage/JoinTeam/JoinTeam';
import TournamentPage from '../pages/user/TournamentPage/TournamentPage';
import TournamentDetailsPage from '../pages/user/TournamentDetailsPage/TournamentDetailsPage';
import NotFoundPage from '../pages/public/NotFoundPage/NotFoundPage';
import HomePage from '../pages/public/HomePage/HomePage';
import ProfilePage from '../pages/user/ProfilePage/ProfilePage';

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthenticatedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="search" element={<SearchPage />} />
        
        {/* Teams routes */}
        <Route path="teams" element={<TeamsPage />} />
        <Route path="teams/create" element={<CreateTeam />} />
        <Route path="teams/join" element={<JoinTeam />} />
        
        {/* TeamSpace route - no longer using nested routes for tabs */}
        <Route path="teams/:teamId" element={<TeamSpace />} />
        <Route path="teams/:teamId/settings" element={<TeamSpace />} />
        
        {/* Tournament routes */}
        <Route path="tournaments" element={<TournamentPage />} />
        <Route path="tournaments/:id" element={<TournamentDetailsPage />} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;