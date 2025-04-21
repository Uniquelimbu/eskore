import React, { Suspense, useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Import styles at the top to avoid ESLint warnings
import './App.css';
import './styles/animations.css';
import './styles/ui-enhancements.css';

// Context providers
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { ConnectionProvider } from './context/ConnectionContext';
import { ThemeProvider } from './theme';

// Import components from organized directories
import { 
  Header, 
  Footer,
  Sidebar,
  SidebarToggle, 
  LoadingFallback,
  ProtectedRoute
} from './components';

import ConnectionAlert from './components/NetworkStatus/ConnectionAlert';
import AuthStatusMonitor from './features/auth/components/AuthStatusMonitor';

// Update to use the correct path for AthleteSidebar
import AthleteSidebar from './features/athlete/components/Sidebar/Sidebar';

// Pages
import HomePage from './pages/HomePage';
import UserHomePage from './pages/UserHomePage';
import NotFoundPage from './pages/NotFoundPage';

// Feature Pages
import LoginPage from './features/auth/pages/LoginPage';
import RoleSelectionPage from './features/auth/pages/RoleSelectionPage';
import AthleteRegistrationPage from './features/auth/pages/AthleteRegistrationPage';
import TeamsPage from './features/teams/pages/TeamsPage';
import LeaguesPage from './features/leagues/pages/LeaguesPage';
import MatchesPage from './features/matches/pages/MatchesPage';
import StandingsPage from './features/leagues/pages/StandingsPage';
import ProfilePage from './features/profiles/pages/ProfilePage';
import SettingsPage from './features/settings/SettingsPage';
import AthleteHomePage from './features/athlete/pages/HomePage';
import AthleteProfilePage from './features/athlete/pages/ProfilePage';
import AthleteStatsPage from './features/athlete/pages/StatsPage';
import AthleteMatchesPage from './features/athlete/pages/MatchesPage';
import AthleteTeamsPage from './features/athlete/pages/TeamsPage';
import AthleteSettingsPage from './features/athlete/pages/AthleteSettingsPage';

// Shop page placeholder
const ShopPage = () => <div>Shop Coming Soon</div>;

// Component to conditionally render layout based on route
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, initialized } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const nodeRef = useRef(null);
  
  // Check if user is an athlete
  const isAthlete = user && (user.role === 'athlete' || user.role === 'athlete_admin');
  
  // Route types
  const publicPages = ['/', '/matches', '/teams', '/leagues', '/standings', '/shop', '/about', '/contact'];
  const authPages = ['/login', '/register', '/role-selection', '/role-selection/athlete'];
  
  // Check route types
  const isAuthPage = authPages.some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  const isAthletePage = location.pathname.startsWith('/athlete/');
  const isPublicPage = publicPages.some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  
  // Show sidebar for logged-in users on any page except login/register
  const showSidebar = user && !isAuthPage;
  
  // Hide header/navbar on auth pages and athlete dashboard home
  const hideHeader = isAuthPage || isAthletePage;
  const hideFooter = isAuthPage || isAthletePage;
  
  // Toggle sidebar visibility on mobile
  const toggleSidebarVisibility = () => {
    setSidebarVisible(!sidebarVisible);
    
    // Toggle body scroll locking
    if (!sidebarVisible) {
      document.body.classList.add('sidebar-opened');
    } else {
      document.body.classList.remove('sidebar-opened');
    }
  };
  
  // Close sidebar when clicking a link on mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarVisible(false);
    }
  }, [location.pathname]);
  
  // Redirect users based on role on initial app load
  useEffect(() => {
    // Only redirect if authentication is initialized and user data is loaded
    if (initialized && !loading) {
      // Only redirect from the home page
      if (location.pathname === '/') {
        if (user) {
          // Redirect based on user role
          if (user.role === 'athlete' || user.role === 'athlete_admin' || user.role === 'admin') {
            // Treat admins like athletes - send them to athlete dashboard
            navigate('/athlete/home', { replace: true });
          } else if (user.role === 'manager') {
            navigate('/manager/home', { replace: true });
          } else if (user.role === 'team') {
            navigate('/team/home', { replace: true });
          }
        }
      }
    }
  }, [user, initialized, loading, location.pathname, navigate]);
  
  // Determine spacing/padding classes
  const mainContentClasses = [
    'main-content',
    isAuthPage ? 'main-content-auth' : '',
    !hideHeader ? 'main-content-with-header' : '',
    showSidebar ? 'main-content-with-sidebar' : '',
    isAthletePage ? 'athlete-dashboard-content' : ''
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`app-container ${isAthletePage ? 'athlete-layout' : ''}`}>
      {/* Use AthleteSidebar for athlete users and regular Sidebar for others */}
      {showSidebar && isAthlete ? (
        <AthleteSidebar 
          className={sidebarVisible ? 'sidebar-active' : ''}
        />
      ) : showSidebar && (
        <Sidebar 
          className={sidebarVisible ? 'sidebar-active' : ''}
          userRole={user?.role || 'user'}
        />
      )}
      
      {/* Mobile Sidebar Toggle - Only show when sidebar should be visible */}
      {showSidebar && (
        <SidebarToggle 
          isOpen={sidebarVisible}
          toggleSidebar={toggleSidebarVisibility}
        />
      )}
      
      {/* Header - Don't show on auth pages and athlete pages */}
      {!hideHeader && <Header />}
      
      {/* Main content with appropriate layout classes */}
      <main className={mainContentClasses}>
        <Suspense fallback={<LoadingFallback />}>
          <SwitchTransition mode="out-in">
            <CSSTransition
              key={location.key}
              nodeRef={nodeRef}
              classNames="page-transition"
              timeout={300}
              unmountOnExit
            >
              <div ref={nodeRef} className="page-transition-wrapper">
                <ErrorBoundary>
                  <Routes location={location}>
                    {/* Public Home vs User Home conditional rendering */}
                    <Route path="/" element={user ? <UserHomePage /> : <HomePage />} />
                    
                    {/* Public Routes */}
                    <Route path="/matches" element={<MatchesPage />} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/leagues" element={<LeaguesPage />} />
                    <Route path="/standings" element={<StandingsPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    
                    {/* Authentication Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/role-selection" element={<RoleSelectionPage />} />
                    <Route path="/role-selection/athlete" element={<AthleteRegistrationPage />} />
                    
                    {/* Protected User Routes */}
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* Athlete Routes with proper nested routing */}
                    <Route path="/athlete">
                      <Route index element={<Navigate to="/athlete/home" replace />} />
                      <Route path="home" element={
                        <ProtectedRoute roles={['athlete', 'athlete_admin', 'admin']}>
                          <AthleteHomePage />
                        </ProtectedRoute>
                      } />
                      {/* Make sure all other athlete routes are properly nested */}
                      <Route path="profile" element={
                        <ProtectedRoute roles={['athlete', 'athlete_admin', 'admin']}>
                          <AthleteProfilePage />
                        </ProtectedRoute>
                      } />
                      <Route path="stats" element={
                        <ProtectedRoute roles={['athlete', 'athlete_admin', 'admin']}>
                          <AthleteStatsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="matches" element={
                        <ProtectedRoute roles={['athlete', 'athlete_admin', 'admin']}>
                          <AthleteMatchesPage />
                        </ProtectedRoute>
                      } />
                      <Route path="teams" element={
                        <ProtectedRoute roles={['athlete', 'athlete_admin', 'admin']}>
                          <AthleteTeamsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="settings" element={
                        <ProtectedRoute roles={['athlete', 'athlete_admin', 'admin']}>
                          <AthleteSettingsPage />
                        </ProtectedRoute>
                      } />
                      {/* Catch-all for any other athlete paths */}
                      <Route path="*" element={<Navigate to="/athlete/home" replace />} />
                    </Route>
                    
                    {/* Remove admin route and redirect admins to athlete dashboard instead */}
                    <Route path="/admin/*" element={<Navigate to="/athlete/home" replace />} />
                    
                    {/* 404 Page */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </ErrorBoundary>
              </div>
            </CSSTransition>
          </SwitchTransition>
        </Suspense>
      </main>
      
      {/* Footer - Don't show on auth pages and athlete pages */}
      {!hideFooter && <Footer />}
      
      {/* Overlay for mobile sidebar - Only show when sidebar is visible */}
      {sidebarVisible && showSidebar && (
        <div 
          className="sidebar-overlay" 
          onClick={toggleSidebarVisibility}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ConnectionProvider>
        <AuthProvider>
          <ThemeProvider>
            <div className="app">
              <ConnectionAlert />
              <AuthStatusMonitor />
              <AppContent />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </ConnectionProvider>
    </Router>
  );
}

export default App;