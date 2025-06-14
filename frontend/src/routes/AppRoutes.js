import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// CORE COMPONENTS - IMMEDIATE LOAD (Critical Path)
// ============================================================================
import AuthenticatedLayout from '../components/layout/AuthenticatedLayout/AuthenticatedLayout.js';
import ProtectedRoute from './ProtectedRoute';

// ============================================================================
// LAZY-LOADED COMPONENTS - CODE SPLITTING FOR PERFORMANCE
// ============================================================================

// Public Pages
const HomePage = lazy(() => import('../pages/public/HomePage/HomePage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage/NotFoundPage'));

// Authentication Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage/LoginPage'));
const UserRegistrationPage = lazy(() => import('../pages/auth/registration/UserRegistrationPage'));

// User Dashboard & Profile
const DashboardPage = lazy(() => import('../pages/user/DashboardPage/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage/ProfilePage'));
const EditProfilePage = lazy(() => import('../pages/user/ProfilePage/components/Edit/EditProfilePage.js'));

// Search & Content
const SearchPage = lazy(() => import('../pages/user/SearchPage/SearchPage'));
const NewsPage = lazy(() => import('../pages/user/NewsPage'));

// Teams & TeamSpace
const TeamsPage = lazy(() => import('../pages/user/TeamsPage/TeamsPage'));
const CreateTeam = lazy(() => import('../pages/user/TeamsPage/CreateTeam/CreateTeam'));
const TeamSpace = lazy(() => import('../pages/user/TeamsPage/TeamSpace/TeamSpace'));
const TeamOverviewPage = lazy(() => import('../pages/user/TeamsPage/JoinTeam/TeamOverviewPage'));

// TeamSpace Pages
const Dashboard = lazy(() => import('../pages/user/TeamsPage/TeamSpace/pages/Dashboard/Dashboard'));
const Squad = lazy(() => import('../pages/user/TeamsPage/TeamSpace/pages/Squad/Squad'));
const Formation = lazy(() => import('../pages/user/TeamsPage/TeamSpace/pages/Formation/Formation'));
const Calendar = lazy(() => import('../pages/user/TeamsPage/TeamSpace/pages/Calendar/Calendar'));
const Settings = lazy(() => import('../pages/user/TeamsPage/TeamSpace/pages/Settings/Settings'));
const TeamRequests = lazy(() => import('../pages/user/TeamsPage/TeamSpace/pages/Squad/TeamRequests/TeamRequests'));
const InMatchRoles = lazy(() => import('../pages/user/TeamsPage/TeamSpace/pages/Formation/components/TeamLogoOverlay/overlays/InMatchRoles'));

// Tournaments
const TournamentPage = lazy(() => import('../pages/user/TournamentPage/TournamentPage'));
const TournamentDetailsPage = lazy(() => import('../pages/user/TournamentDetailsPage/TournamentDetailsPage'));

// Notifications
const NotificationDetailView = lazy(() => import('../pages/user/Notifications/NotificationDetailView'));

// Admin
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard/index.js'));

// ============================================================================
// ENHANCED LOADING COMPONENTS
// ============================================================================

/**
 * Enhanced loading component with better UX
 */
const PageLoadingSpinner = ({ message = "Loading..." }) => (
  <div className="page-loading-container">
    <div className="page-loading-content">
      <div className="loading-spinner large"></div>
      <h3>{message}</h3>
      <p>Please wait while we load your content</p>
    </div>
  </div>
);

/**
 * Specialized loading for TeamSpace components
 */
const TeamSpaceLoading = () => (
  <PageLoadingSpinner message="Loading Team Workspace..." />
);

/**
 * Specialized loading for Dashboard components
 */
const DashboardLoading = () => (
  <PageLoadingSpinner message="Loading Dashboard..." />
);

// ============================================================================
// ENHANCED ROUTE GUARD COMPONENTS
// ============================================================================

/**
 * AuthRoute: Enhanced authentication guard with better loading states
 */
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Enhanced loading state
  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-content">
          <div className="loading-spinner"></div>
          <h3>Authenticating...</h3>
          <p>Verifying your credentials</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated - render children
  return children;
};

/**
 * AdminRoute: Enhanced admin guard with role checking
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, hasRole, user } = useAuth();
  
  // Loading state
  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-loading-content">
          <div className="loading-spinner"></div>
          <h3>Verifying Admin Access...</h3>
          <p>Checking permissions</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Not admin - redirect to dashboard with notification
  if (!hasRole('admin')) {
    console.warn('AdminRoute: Access denied - user lacks admin role');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Admin authenticated - render children
  return children;
};

/**
 * TeamMemberRoute: Ensures user is a member of the team
 */
const TeamMemberRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <TeamSpaceLoading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Additional team membership validation could be added here
  // For now, we rely on TeamSpace component to handle team access
  return children;
};

// ============================================================================
// MAIN ROUTING CONFIGURATION
// ============================================================================

const AppRoutes = () => {
  return (
    <Routes>
      {/* =====================================================================
          PUBLIC ROUTES - No authentication required
          ===================================================================== */}
      
      <Route 
        path="/" 
        element={
          <Suspense fallback={<PageLoadingSpinner message="Loading Home..." />}>
            <HomePage />
          </Suspense>
        } 
      />
      
      <Route 
        path="/about" 
        element={
          <Suspense fallback={<PageLoadingSpinner message="Loading About..." />}>
            <AboutPage />
          </Suspense>
        } 
      />

      {/* =====================================================================
          AUTHENTICATION ROUTES
          ===================================================================== */}
      
      <Route 
        path="/login" 
        element={
          <Suspense fallback={<PageLoadingSpinner message="Loading Login..." />}>
            <LoginPage />
          </Suspense>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <Suspense fallback={<PageLoadingSpinner message="Loading Registration..." />}>
            <UserRegistrationPage />
          </Suspense>
        } 
      />

      {/* =====================================================================
          AUTHENTICATED USER ROUTES - Main application
          ===================================================================== */}
      
      <Route 
        element={
          <AuthRoute>
            <AuthenticatedLayout />
          </AuthRoute>
        }
      >
        {/* User Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <Suspense fallback={<DashboardLoading />}>
              <DashboardPage />
            </Suspense>
          } 
        />

        {/* User Profile */}
        <Route 
          path="/profile" 
          element={
            <Suspense fallback={<PageLoadingSpinner message="Loading Profile..." />}>
              <ProfilePage />
            </Suspense>
          } 
        />
        
        <Route 
          path="/profile/edit" 
          element={
            <Suspense fallback={<PageLoadingSpinner message="Loading Profile Editor..." />}>
              <EditProfilePage />
            </Suspense>
          } 
        />

        {/* Search & Content */}
        <Route 
          path="/search" 
          element={
            <Suspense fallback={<PageLoadingSpinner message="Loading Search..." />}>
              <SearchPage />
            </Suspense>
          } 
        />
        
        <Route 
          path="/news" 
          element={
            <Suspense fallback={<PageLoadingSpinner message="Loading News..." />}>
              <NewsPage />
            </Suspense>
          } 
        />

        {/* ===================================================================
            TEAMS SECTION - Enhanced with proper nesting
            =================================================================== */}
        
        <Route 
          path="/teams" 
          element={
            <Suspense fallback={<PageLoadingSpinner message="Loading Teams..." />}>
              <TeamsPage />
            </Suspense>
          } 
        />
        
        <Route 
          path="/teams/create" 
          element={
            <Suspense fallback={<PageLoadingSpinner message="Loading Team Creator..." />}>
              <CreateTeam />
            </Suspense>
          } 
        />

        {/* Team Overview (Join/View) */}
        <Route 
          path="/team-overview/:teamId" 
          element={
            <Suspense fallback={<PageLoadingSpinner message="Loading Team Overview..." />}>
              <TeamOverviewPage />
            </Suspense>
          } 
        />

        {/* ===================================================================
            TEAMSPACE - Enhanced with Dashboard integration
            =================================================================== */}
        
        <Route 
          path="/teams/:teamId/space" 
          element={
            <TeamMemberRoute>
              <Suspense fallback={<TeamSpaceLoading />}>
                <TeamSpace />
              </Suspense>
            </TeamMemberRoute>
          }
        >
          {/* ✅ ADDED: Dashboard as default and explicit routes */}
          <Route 
            index 
            element={
              <Suspense fallback={<DashboardLoading />}>
                <Dashboard />
              </Suspense>
            } 
          />
          
          <Route 
            path="dashboard" 
            element={
              <Suspense fallback={<DashboardLoading />}>
                <Dashboard />
              </Suspense>
            } 
          />

          {/* Squad Management */}
          <Route 
            path="squad" 
            element={
              <Suspense fallback={<PageLoadingSpinner message="Loading Squad..." />}>
                <Squad />
              </Suspense>
            } 
          />

          {/* Formation & Tactics */}
          <Route 
            path="formation" 
            element={
              <Suspense fallback={<PageLoadingSpinner message="Loading Formation..." />}>
                <Formation />
              </Suspense>
            } 
          />
          
          <Route 
            path="formation/in-match-roles" 
            element={
              <Suspense fallback={<PageLoadingSpinner message="Loading Match Roles..." />}>
                <InMatchRoles />
              </Suspense>
            } 
          />

          {/* Calendar & Events */}
          <Route 
            path="calendar" 
            element={
              <Suspense fallback={<PageLoadingSpinner message="Loading Calendar..." />}>
                <Calendar />
              </Suspense>
            } 
          />

          {/* Team Settings */}
          <Route 
            path="settings" 
            element={
              <Suspense fallback={<PageLoadingSpinner message="Loading Settings..." />}>
                <Settings />
              </Suspense>
            } 
          />
        </Route>

        {/* Team Requests (Outside TeamSpace) */}
        <Route 
          path="/teams/:teamId/requests" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner message="Loading Team Requests..." />}>
                <TeamRequests />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        {/* ===================================================================
            TOURNAMENTS SECTION
            =================================================================== */}
        
        <Route 
          path="/tournaments" 
          element={
            <Suspense fallback={<PageLoadingSpinner message="Loading Tournaments..." />}>
              <TournamentPage />
            </Suspense>
          } 
        />
        
        <Route 
          path="/tournaments/:id" 
          element={
            <Suspense fallback={<PageLoadingSpinner message="Loading Tournament Details..." />}>
              <TournamentDetailsPage />
            </Suspense>
          } 
        />

        {/* ===================================================================
            NOTIFICATIONS
            =================================================================== */}
        
        <Route 
          path="/invitations/:notificationId" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<PageLoadingSpinner message="Loading Invitation..." />}>
                <NotificationDetailView />
              </Suspense>
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* =====================================================================
          ADMIN ROUTES - Separate from user routes for better security
          ===================================================================== */}
      
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminRoute>
            <AuthenticatedLayout>
              <Suspense fallback={<PageLoadingSpinner message="Loading Admin Dashboard..." />}>
                <AdminDashboard />
              </Suspense>
            </AuthenticatedLayout>
          </AdminRoute>
        } 
      />

      {/* =====================================================================
          ERROR HANDLING - 404 and catch-all
          ===================================================================== */}
      
      <Route 
        path="*" 
        element={
          <Suspense fallback={<PageLoadingSpinner />}>
            <NotFoundPage />
          </Suspense>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;