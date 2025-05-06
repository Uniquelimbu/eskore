import React from 'react';
import ProfilePage from '../pages/user/ProfilePage';
import DashboardPage from '../pages/user/DashboardPage';
import SearchPage from '../pages/user/SearchPage';
import LeaderboardPage from '../pages/user/LeaderboardPage';
import TeamsPage from '../pages/user/TeamsPage';
import TeamDetailsPage from '../pages/user/TeamDetailsPage';
import TournamentPage from '../pages/user/TournamentPage';
import TournamentDetailsPage from '../pages/user/TournamentDetailsPage';
import AdminDashboard from '../pages/admin/Dashboard';
import CreateTeam from '../pages/user/TeamsPage/CreateTeam';
import TeamDashboard from '../pages/user/TeamDashboard';
import TeamSpace from '../pages/user/TeamSpace';

// Define all private routes that require authentication
export const privateRoutes = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/leaderboards', element: <LeaderboardPage /> },
  { path: '/teams', element: <TeamsPage /> },
  { path: '/teams/create', element: <CreateTeam /> },
  { path: '/teams/:id', element: <TeamDetailsPage /> },
  { path: '/teams/:teamId/dashboard/*', element: <TeamDashboard /> },
  
  // Team space routes
  { path: '/teams/:teamId/space', element: <TeamSpace /> },
  { path: '/teams/:teamId/space/*', element: <TeamSpace /> },
  
  { path: '/tournaments', element: <TournamentPage /> },
  { path: '/tournaments/:id', element: <TournamentDetailsPage /> },
  { path: '/admin/dashboard', element: <AdminDashboard /> }
];

// Define all public routes
export const publicRoutes = [
  // Add public routes here
];

export default {
  privateRoutes,
  publicRoutes
};