import React from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Main pages
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import UserHomePage from '../pages/UserHomePage';

// Feature pages
import LoginPage from '../features/auth/pages/LoginPage';
import RoleSelectionPage from '../features/auth/pages/RoleSelectionPage';
import AthleteRegistrationPage from '../features/auth/pages/AthleteRegistrationPage';
import TeamsPage from '../features/teams/pages/TeamsPage';
import LeaguesPage from '../features/leagues/pages/LeaguesPage';
import MatchesPage from '../features/matches/pages/MatchesPage';
import StandingsPage from '../features/leagues/pages/StandingsPage';
import ProfilePage from '../features/profiles/pages/ProfilePage';
import SettingsPage from '../features/settings/SettingsPage';
import ManagerHomePage from '../features/manager/pages/ManagerHomePage';
import ManagerProfilePage from '../features/manager/pages/ManagerProfilePage';
import TeamProfilePage from '../features/teams/pages/TeamProfilePage';

// Athlete pages with correct paths
import AthleteHomePage from '../features/athlete/pages/HomePage';
import AthleteProfilePage from '../features/athlete/pages/ProfilePage';
import AthleteStatsPage from '../features/athlete/pages/StatsPage';
import AthleteMatchesPage from '../features/athlete/pages/MatchesPage';
import AthleteTeamsPage from '../features/athlete/pages/TeamsPage';
import AthleteSettingsPage from '../features/athlete/pages/AthleteSettingsPage';

// Shop page placeholder component
const ShopPage = () => <div>Shop Coming Soon</div>;

// Route configuration objects
const routes = [
  {
    path: '/',
    element: (user) => (user ? <UserHomePage /> : <HomePage />),
    public: true,
  },
  {
    path: '/login',
    element: <LoginPage />,
    public: true,
    layout: 'auth',
  },
  {
    path: '/role-selection',
    element: <RoleSelectionPage />,
    public: true,
    layout: 'auth',
  },
  {
    path: '/role-selection/athlete',
    element: <AthleteRegistrationPage />,
    public: true,
    layout: 'auth',
  },
  {
    path: '/matches',
    element: <MatchesPage />,
    public: true,
  },
  {
    path: '/teams',
    element: <TeamsPage />,
    public: true,
  },
  {
    path: '/leagues',
    element: <LeaguesPage />,
    public: true,
  },
  {
    path: '/standings',
    element: <StandingsPage />,
    public: true,
  },
  {
    path: '/shop',
    element: <ShopPage />,
    public: true,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    public: false,    
    roles: ['athlete', 'athlete_admin', 'manager', 'team', 'admin'],
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    public: false,
    roles: ['athlete', 'athlete_admin', 'manager', 'team', 'admin'],
  },
  // Athlete routes
  {
    path: '/athlete',
    element: <Navigate to="/athlete/home" replace />,
    public: false,
    roles: ['athlete', 'athlete_admin', 'admin'],
  },
  {
    path: '/athlete/home',
    element: <AthleteHomePage />,
    public: false,
    roles: ['athlete', 'athlete_admin', 'admin'],
    layout: 'athlete',
  },
  {
    path: '/athlete/profile',
    element: <AthleteProfilePage />,
    public: false,
    roles: ['athlete', 'athlete_admin', 'admin'],
    layout: 'athlete',
  },
  {
    path: '/athlete/stats',
    element: <AthleteStatsPage />,
    public: false,
    roles: ['athlete', 'athlete_admin', 'admin'],
    layout: 'athlete',
  },
  {
    path: '/athlete/matches',
    element: <AthleteMatchesPage />,
    public: false,
    roles: ['athlete', 'athlete_admin', 'admin'],
    layout: 'athlete',
  },
  {
    path: '/athlete/teams',
    element: <AthleteTeamsPage />,
    public: false,
    roles: ['athlete', 'athlete_admin', 'admin'],
    layout: 'athlete',
  },
  {
    path: '/athlete/settings',
    element: <AthleteSettingsPage />,
    public: false,
    roles: ['athlete', 'athlete_admin', 'admin'],
    layout: 'athlete',
  },
  // Manager routes
  {
    path: '/manager/home',
    element: <ManagerHomePage />,
    public: false,
    roles: ['manager'],
    layout: 'manager',
  },
  {
    path: '/manager/profile',
    element: <ManagerProfilePage />,
    public: false,
    roles: ['manager'],
    layout: 'manager',
  },
  // Team routes
  {
    path: '/team/:teamId',
    element: <TeamProfilePage />,
    public: false,
    roles: ['athlete', 'manager', 'team'],
    layout: 'default',
  },
  // Not found route
  {
    path: '*',
    element: <NotFoundPage />,
    public: true,
  },
];

/**
 * Helper to generate Route components from config
 * @param {string} userRole - The current user's role
 * @returns {Array<Object>} Configured routes for React Router
 */
export const generateRoutes = (userRole) => {
  return routes.map((route) => ({
    path: route.path,
    element: route.public ? (
      typeof route.element === 'function' ? route.element(userRole) : route.element
    ) : (
      <ProtectedRoute roles={route.roles}>{route.element}</ProtectedRoute>
    ),
    layout: route.layout || 'default',
  }));
};

// Export categorized routes for programmatic access
export const categorizedRoutes = {
  public: routes.filter(route => route.public),
  auth: routes.filter(route => route.layout === 'auth'),
  athlete: routes.filter(route => route.layout === 'athlete'),
  manager: routes.filter(route => route.layout === 'manager'),
  team: routes.filter(route => route.path.includes('/team/')),
  protected: routes.filter(route => !route.public && route.layout === 'default'),
};

export default routes;
