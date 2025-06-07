import React from 'react';
import ProfilePage from '../pages/user/ProfilePage';
import DashboardPage from '../pages/user/DashboardPage';
import SearchPage from '../pages/user/SearchPage';
// import LeaderboardPage from '../pages/user/LeaderboardPage';
import TeamsPage from '../pages/user/TeamsPage';
// Remove missing import: import TeamDetailsPage from '../pages/user/TeamDetailsPage';
import TournamentPage from '../pages/user/TournamentPage';
import TournamentDetailsPage from '../pages/user/TournamentDetailsPage';
import AdminDashboard from '../pages/admin/Dashboard/index.js';
import CreateTeam from '../pages/user/TeamsPage/CreateTeam';
// Remove missing import: import TeamDashboard from '../pages/user/TeamDashboard';
import TeamSpace from '../pages/user/TeamsPage/TeamSpace';
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import UserRegistrationPage from '../pages/auth/registration/UserRegistrationPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Define all public routes
export const publicRoutes = [
  { path: '/', element: <HomePage />, exact: true },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <UserRegistrationPage /> }
];

// Define all private routes that require authentication
export const privateRoutes = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/search', element: <SearchPage /> },
  // { path: '/leaderboards', element: <LeaderboardPage /> },
  { path: '/teams', element: <TeamsPage />, exact: true },
  { path: '/teams/create', element: <CreateTeam /> },
  // Replace missing TeamDetailsPage with TeamSpace as a temporary solution
  { path: '/teams/:id', element: <TeamSpace /> },
  // Remove or comment out route using TeamDashboard
  // { path: '/teams/:teamId/dashboard/*', element: <TeamDashboard /> },
  { path: '/teams/:teamId/space', element: <TeamSpace />, exact: true },
  { path: '/teams/:teamId/space/*', element: <TeamSpace /> },
  { path: '/teams/:teamId/requests', element: <TeamRequests /> },
  { path: '/tournaments', element: <TournamentPage />, exact: true },
  { path: '/tournaments/:id', element: <TournamentDetailsPage /> },
  { path: '/admin/dashboard', element: <AdminDashboard /> }
];

// Special routes
export const specialRoutes = [
  { path: '*', element: <NotFoundPage /> }
];

const routes = {
  publicRoutes,
  privateRoutes,
  specialRoutes
};

export default routes;