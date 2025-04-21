/**
 * Authentication Feature Module
 * 
 * This module contains all components and functionality 
 * related to user authentication and authorization.
 */

// Export page components
export { default as LoginPage } from './pages/LoginPage';
export { default as RoleSelectionPage } from './pages/RoleSelectionPage';
export { default as AthleteRegistrationPage } from './pages/AthleteRegistrationPage';

// Export components
export { default as AuthStatusMonitor } from './components/AuthStatusMonitor';
export { default as AuthForm } from './components/AuthForm/AuthForm';
export { default as LoginForm } from './components/LoginForm/LoginForm';
export { default as RegisterForm } from './components/RegisterForm/RegisterForm';

// Export context and hooks
export { AuthProvider, useAuth } from './context/AuthContext';

// Export API functions
// Add API exports here as they're created