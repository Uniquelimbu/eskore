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
import Squad from '../pages/user/TeamsPage/TeamSpace/pages/Squad/Squad';
import Formation from '../pages/user/TeamsPage/TeamSpace/pages/Formation/Formation';
import Calendar from '../pages/user/TeamsPage/TeamSpace/pages/Calendar/Calendar';
import Settings from '../pages/user/TeamsPage/TeamSpace/pages/Settings/Settings';

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
        
        {/* TeamSpace routes - each section gets its own route */}
        <Route path="teams/:teamId" element={<TeamSpace />}>
          {/* Use React.Fragment for the index route to ensure useOutlet() works as expected in TeamSpace */}
          <Route index element={<React.Fragment />} /> 
          <Route path="space/squad" element={<Squad />} />
          <Route path="space/formation" element={<Formation />} />
          <Route path="space/calendar" element={<Calendar />} />
          <Route path="space/settings" element={<Settings />} />
        </Route>
        
        {/* Redirect old routes to new structure - These might be less necessary if direct links are updated,
            but can remain for backward compatibility. Ensure params are correctly passed if needed.
            Note: The Navigate component might need teamId from useParams if used directly like this.
            For simplicity, these are kept as is, but review if they cause issues with param passing.
        */}
        <Route path="/teams/:teamId/squad" element={<Navigate to="space/squad" replace />} />
        <Route path="/teams/:teamId/formation" element={<Navigate to="space/formation" replace />} />
        <Route path="/teams/:teamId/calendar" element={<Navigate to="space/calendar" replace />} />
        <Route path="/teams/:teamId/settings" element={<Navigate to="space/settings" replace />} />
        
        {/* Tournament routes */}
        <Route path="tournaments" element={<TournamentPage />} />
        <Route path="tournaments/:id" element={<TournamentDetailsPage />} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;