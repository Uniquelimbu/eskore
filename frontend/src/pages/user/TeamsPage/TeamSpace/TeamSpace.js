import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useTeam } from '../../../../contexts/TeamContext';
// ✅ REMOVED: Sidebar import - using main app sidebar only

// ✅ ENHANCED: Import ONLY essential styles to avoid conflicts
import './styles/variables.css';    // CSS custom properties only
import './styles/utilities.css';    // Non-layout utilities only
// ❌ REMOVED: './styles/index.css' - Contains conflicting layout.css

// ✅ ENHANCED: Import component system with error-resistant loading
let TeamSpaceErrorBoundary, LoadingScreen, TeamSpaceLayout, ErrorScreen, useErrorBoundary;

try {
  const components = require('./components');
  
  // Core components - with fallbacks
  TeamSpaceErrorBoundary = components.TeamSpaceErrorBoundary || React.Fragment;
  LoadingScreen = components.LoadingScreen || DefaultLoadingScreen;
  TeamSpaceLayout = components.TeamSpaceLayout || DefaultLayout;
  ErrorScreen = components.ErrorScreen || DefaultErrorScreen;
  useErrorBoundary = components.useErrorBoundary || (() => ({ 
    showBoundary: () => {}, 
    resetBoundary: () => {} 
  }));
  
  console.log('✅ TeamSpace: Component system loaded successfully');
} catch (importError) {
  console.warn('⚠️ TeamSpace: Component system not available, using fallbacks:', importError.message);
  
  // Fallback components
  TeamSpaceErrorBoundary = ({ children, onError }) => {
    try {
      return <React.Fragment>{children}</React.Fragment>;
    } catch (error) {
      if (onError) onError(error);
      return <DefaultErrorScreen error={error} />;
    }
  };
  
  LoadingScreen = DefaultLoadingScreen;
  TeamSpaceLayout = DefaultLayout;
  ErrorScreen = DefaultErrorScreen;
  useErrorBoundary = () => ({ 
    showBoundary: (error) => console.error('Error boundary:', error), 
    resetBoundary: () => console.log('Error boundary reset') 
  });
}

// ✅ FALLBACK COMPONENTS: Simple, reliable implementations
function DefaultLoadingScreen({ 
  message = "Loading...", 
  subtitle = "", 
  size = "large",
  overlay = false 
}) {
  const overlayStyle = overlay ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 32, 44, 0.8)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } : {};

  return (
    <div style={{
      ...overlayStyle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: overlay ? 'auto' : '400px',
      flexDirection: 'column',
      gap: '16px',
      padding: '40px',
      textAlign: 'center',
      color: 'var(--text-light, #e2e8f0)'
    }}>
      <div style={{
        width: size === 'large' ? '48px' : size === 'small' ? '24px' : '32px',
        height: size === 'large' ? '48px' : size === 'small' ? '24px' : '32px',
        border: '3px solid var(--primary-color, #4a6cf7)',
        borderTop: '3px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '600' }}>
          {message}
        </h3>
        {subtitle && (
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
            {subtitle}
          </p>
        )}
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function DefaultErrorScreen({ 
  title = "Error", 
  message = "Something went wrong", 
  error = null,
  showRetry = true,
  onRetry = null,
  retryText = "Retry",
  retryDisabled = false,
  showBackButton = false,
  onBack = null,
  backText = "Go Back",
  additionalInfo = null
}) {
  const errorMessage = typeof error === 'string' ? error : 
                     error?.message || message;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      flexDirection: 'column',
      gap: '16px',
      textAlign: 'center',
      padding: '40px',
      color: 'var(--text-light, #e2e8f0)'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
      <h3 style={{ 
        color: 'var(--danger-color, #f56565)', 
        margin: '0 0 8px 0',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      <p style={{ 
        color: 'var(--text-muted, #a0aec0)', 
        margin: '0 0 16px 0',
        fontSize: '1rem',
        maxWidth: '500px'
      }}>
        {errorMessage}
      </p>
      {additionalInfo && (
        <p style={{ 
          fontSize: '0.875rem', 
          opacity: 0.7, 
          margin: '0 0 20px 0',
          fontStyle: 'italic'
        }}>
          {additionalInfo}
        </p>
      )}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {showRetry && onRetry && (
          <button 
            onClick={onRetry}
            disabled={retryDisabled}
            style={{
              padding: '12px 20px',
              backgroundColor: retryDisabled ? '#4a5568' : 'var(--primary-color, #4a6cf7)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: retryDisabled ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'background-color 0.2s',
              opacity: retryDisabled ? 0.6 : 1
            }}
          >
            {retryText}
          </button>
        )}
        {showBackButton && onBack && (
          <button 
            onClick={onBack}
            style={{
              padding: '12px 20px',
              backgroundColor: 'var(--secondary-color, #2d3748)',
              color: 'white',
              border: '1px solid var(--border-color, #4a5568)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
          >
            {backText}
          </button>
        )}
      </div>
    </div>
  );
}

// ✅ UPDATED: Default layout without sidebar functionality
function DefaultLayout({ children, className = "" }) {
  return (
    <div className={`team-space-default-layout no-sidebar ${className}`}>
      {/* ✅ REMOVED: Sidebar rendering */}
      <main className="team-space-main">
        <div className="team-space-content">
          {children}
        </div>
      </main>
      <style jsx>{`
        .team-space-default-layout {
          width: 100%;
          min-height: 100vh;
          background-color: var(--bg-dark, #1a202c);
          color: var(--text-light, #e2e8f0);
        }
        .team-space-main {
          width: 100%;
        }
        .team-space-content {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 40px;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .team-space-content {
            padding: 12px 16px;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * TeamSpace Component - INDUSTRY STANDARD WITH NO INTERNAL SIDEBAR
 * 
 * ✅ UPDATED: Removed internal sidebar - uses main app sidebar only
 * 
 * Enhanced with:
 * - Error-resistant component loading
 * - Comprehensive fallback components
 * - Better error handling and recovery
 * - Performance optimizations
 * - Accessibility improvements
 */
const TeamSpace = () => {
  const { teamId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const {
    currentTeam,
    isManager,
    teamMembers,
    loading: teamLoading,
    error: teamError,
    getTeamById,
    switchToTeam,
    refreshCurrentTeam,
    clearError
  } = useTeam();

  // ✅ ENHANCED: Error boundary hook with fallback
  const { showBoundary, resetBoundary } = useErrorBoundary();

  // Local state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  // ✅ REMOVED: Sidebar state management
  const [lastRefresh, setLastRefresh] = useState(null);

  // Current page derivation with enhanced logic
  const currentPage = useMemo(() => {
    const pathSegments = location.pathname.split('/');
    const spaceIndex = pathSegments.findIndex(segment => segment === 'space');
    if (spaceIndex >= 0 && pathSegments[spaceIndex + 1]) {
      return pathSegments[spaceIndex + 1];
    }
    return 'dashboard';
  }, [location.pathname]);

  // Enhanced error handling
  const handleError = useCallback((error, errorInfo) => {
    console.error('TeamSpace: Critical error occurred:', error, errorInfo);
    const errorMessage = error?.message || 'An unexpected error occurred';
    setError(errorMessage);
    
    // Analytics tracking
    if (window.gtag && currentTeam) {
      window.gtag('event', 'teamspace_error', {
        error_message: errorMessage,
        team_id: currentTeam.id,
        page: currentPage,
        timestamp: new Date().toISOString()
      });
    }
    
    try {
      showBoundary(error);
    } catch (boundaryError) {
      console.warn('Error boundary not available:', boundaryError);
    }
  }, [showBoundary, currentTeam, currentPage]);

  // Enhanced retry mechanism with exponential backoff
  const handleRetry = useCallback(async () => {
    if (retryCount >= 3) {
      setError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    setRetryCount(prev => prev + 1);
    
    console.log(`TeamSpace: Retry attempt ${retryCount + 1} for team ${teamId} (delay: ${delay}ms)`);
    
    try {
      resetBoundary();
    } catch (boundaryError) {
      console.warn('Error boundary reset not available:', boundaryError);
    }
    
    setError(null);
    
    setTimeout(async () => {
      setLoading(true);
      
      try {
        const team = await getTeamById(teamId);
        
        if (team) {
          await switchToTeam(team);
          setError(null);
          setLastRefresh(new Date());
          clearError();
          setRetryCount(0); // Reset on success
          
          // Success analytics
          if (window.gtag) {
            window.gtag('event', 'teamspace_retry_success', {
              team_id: team.id,
              retry_count: retryCount + 1,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          throw new Error('Team not found or access denied');
        }
      } catch (retryError) {
        console.error(`TeamSpace: Retry attempt ${retryCount + 1} failed:`, retryError);
        handleError(retryError);
      } finally {
        setLoading(false);
      }
    }, delay);
  }, [retryCount, teamId, getTeamById, switchToTeam, clearError, resetBoundary, handleError]);

  // Team loading logic with enhanced error handling
  useEffect(() => {
    const ensureCorrectTeam = async () => {
      if (!teamId || !user || !isAuthenticated) return;
      
      console.log(`TeamSpace: Ensuring correct team - URL: ${teamId}, Current: ${currentTeam?.id}`);
      
      if (!currentTeam || currentTeam.id.toString() !== teamId) {
        setLoading(true);
        setError(null);
        
        try {
          console.log(`TeamSpace: Fetching team ${teamId}`);
          const team = await getTeamById(teamId);
          
          if (team) {
            console.log(`TeamSpace: Switching to team ${team.name} (ID: ${team.id})`);
            await switchToTeam(team);
            setLastRefresh(new Date());
            clearError();
            
            // Success analytics
            if (window.gtag) {
              window.gtag('event', 'teamspace_loaded', {
                team_id: team.id,
                team_name: team.name,
                page: currentPage,
                timestamp: new Date().toISOString()
              });
            }
          } else {
            throw new Error('Team not found or you do not have access to this team');
          }
        } catch (ensureError) {
          console.error('TeamSpace: Error ensuring correct team:', ensureError);
          handleError(ensureError);
          
          // Navigate to teams page if access error
          if (ensureError.message?.includes('not found') || ensureError.message?.includes('access')) {
            console.log('TeamSpace: Redirecting to teams page due to access error');
            setTimeout(() => navigate('/teams'), 2000);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    ensureCorrectTeam();
  }, [teamId, user, isAuthenticated, currentTeam, getTeamById, switchToTeam, clearError, navigate, handleError, currentPage]);

  // Auto-redirect to dashboard if on base team space URL
  useEffect(() => {
    if (location.pathname === `/teams/${teamId}/space` && currentTeam && !loading) {
      console.log('TeamSpace: Redirecting to dashboard from base path');
      navigate(`/teams/${teamId}/space/dashboard`, { replace: true });
    }
  }, [location.pathname, teamId, currentTeam, loading, navigate]);

  // ✅ REMOVED: Sidebar management logic

  // Enhanced context value for child components
  const contextValue = useMemo(() => ({
    // Team data
    currentTeam,
    isManager,
    teamMembers,
    
    // Loading states
    isLoading: loading || teamLoading,
    error: error || teamError,
    
    // Actions
    refreshTeamData: handleRetry,
    clearError: () => {
      setError(null);
      clearError();
      try {
        resetBoundary();
      } catch (e) {
        console.warn('Error boundary reset not available:', e);
      }
    },
    
    // UI state
    currentPage,
    // ✅ REMOVED: Sidebar state
    
    // Metadata
    lastRefresh,
    retryCount,
    
    // Enhanced utilities
    analytics: {
      trackEvent: (event, data) => {
        if (window.gtag && currentTeam) {
          window.gtag('event', event, {
            team_id: currentTeam.id,
            page: currentPage,
            ...data
          });
        }
      }
    }
  }), [
    currentTeam,
    isManager,
    teamMembers,
    loading,
    teamLoading,
    error,
    teamError,
    handleRetry,
    clearError,
    resetBoundary,
    currentPage,
    lastRefresh,
    retryCount
  ]);

  // ✅ AUTHENTICATION CHECK: Early return pattern
  if (!isAuthenticated) {
    return (
      <ErrorScreen
        title="Authentication Required"
        message="Please log in to access team spaces."
        showRetry={true}
        onRetry={() => navigate('/login')}
        retryText="Go to Login"
      />
    );
  }

  // ✅ LOADING STATE: Enhanced with better messaging
  if ((loading || teamLoading) && !currentTeam) {
    return (
      <LoadingScreen
        message="Loading Team Space"
        subtitle={`Setting up workspace for ${teamId ? `team ${teamId}` : 'your team'}`}
        size="large"
      />
    );
  }

  // ✅ ERROR STATE: Enhanced with retry mechanism
  if ((error || teamError) && !currentTeam) {
    const displayError = error || teamError || 'Something went wrong loading the team.';
    
    return (
      <ErrorScreen
        title="Unable to Load Team"
        message={displayError}
        showRetry={true}
        onRetry={handleRetry}
        retryText={loading ? 'Retrying...' : `Retry${retryCount > 0 ? ` (${retryCount}/3)` : ''}`}
        retryDisabled={loading}
        showBackButton={true}
        onBack={() => navigate('/teams')}
        backText="Back to Teams"
        additionalInfo={retryCount > 0 ? `Retry attempt ${retryCount} of 3` : undefined}
      />
    );
  }

  // ✅ NO TEAM STATE
  if (!currentTeam && !loading && !teamLoading) {
    return (
      <ErrorScreen
        title="No Team Selected"
        message="Please select a team to access the workspace."
        showRetry={true}
        onRetry={() => navigate('/teams')}
        retryText="Go to Teams"
      />
    );
  }

  // ✅ MAIN RENDER: No sidebar, using main app layout
  return (
    <TeamSpaceErrorBoundary
      onError={handleError}
      onRetry={handleRetry}
    >
      <TeamSpaceLayout
        // ✅ REMOVED: All sidebar-related props
        className="team-space-enhanced no-sidebar"
      >
        {/* Outlet for nested routes */}
        <Outlet context={contextValue} />
        
        {/* Loading overlay for refresh operations */}
        {loading && currentTeam && (
          <LoadingScreen
            message="Updating team data..."
            size="small"
            overlay={true}
          />
        )}
      </TeamSpaceLayout>
    </TeamSpaceErrorBoundary>
  );
};

// ✅ ENHANCED: Display name and performance optimization
TeamSpace.displayName = 'TeamSpace';

// ✅ ENHANCED: Memoization for performance
export default React.memo(TeamSpace);