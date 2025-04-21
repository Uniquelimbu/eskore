/**
 * Athlete Feature Module
 * 
 * This module contains all components and functionality 
 * related to athlete users and the athlete dashboard.
 */

// Export page components
export { default as AthleteHomePage } from './pages/HomePage';
export { default as AthleteProfilePage } from './pages/ProfilePage';
export { default as AthleteStatsPage } from './pages/StatsPage';
export { default as AthleteMatchesPage } from './pages/MatchesPage';
export { default as AthleteTeamsPage } from './pages/TeamsPage';
export { default as AthleteSettingsPage } from './pages/AthleteSettingsPage';

// Export layout components
export { default as AthletePageLayout } from './components/PageLayout/AthletePageLayout';
export { default as AthleteSidebar } from './components/Sidebar/Sidebar';

// Export any hooks, contexts, and API functions
// Add these exports as you create them in the respective directories