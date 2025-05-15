import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout';
import DashboardPage from '../pages/user/DashboardPage/DashboardPage';
import SearchPage from '../pages/user/SearchPage/SearchPage';
import TeamsPage from '../pages/user/TeamsPage/TeamsPage';
import TeamSpace from '../pages/user/TeamsPage/TeamSpace';
import CreateTeam from '../pages/user/TeamsPage/CreateTeam/CreateTeam';
import JoinTeam from '../pages/user/TeamsPage/JoinTeam/JoinTeam';
import TournamentPage from '../pages/user/TournamentPage/TournamentPage';
import TournamentDetailsPage from '../pages/user/TournamentDetailsPage/TournamentDetailsPage';
import NotFoundPage from '../pages/public/NotFoundPage/NotFoundPage';

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthenticatedLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="search" element={<SearchPage />} />
        
        {/* Teams routes */}
        <Route path="teams" element={<TeamsPage />} />
        <Route path="teams/create" element={<CreateTeam />} />
        <Route path="teams/join" element={<JoinTeam />} />
        
        {/* Team space routes - now with nested page routes */}
        <Route path="teams/:teamId/*" element={<TeamSpace />}>
          {/* These routes need to match the /space/tabName structure */}
          <Route path="space/overview" element={null} />
          <Route path="space/squad" element={null} />
          <Route path="space/formation" element={<Formation />} />
          <Route path="space/calendar" element={null} />
          <Route path="space/chat" element={null} />
          <Route path="space/settings" element={null} />
        </Route>
        
        {/* Tournament routes */}
        <Route path="tournaments" element={<TournamentPage />} />
        <Route path="tournaments/:id" element={<TournamentDetailsPage />} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;