import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { useTeam } from '../../../../../../contexts/TeamContext';
import { useAuth } from '../../../../../../contexts/AuthContext';
import DashboardGrid from './components/DashboardGrid/DashboardGrid';
import TeamHeader from './components/TeamHeader/TeamHeader';
import './Dashboard.css';

/**
 * Dashboard Component
 * 
 * Main dashboard component for TeamSpace that displays team overview
 * and navigation cards. Consolidates team display logic and provides
 * a clean, minimalistic interface matching the provided screenshot.
 * 
 * Features:
 * - Team header with logo, name, and metadata
 * - Navigation grid with cards for Squad, Formation, Calendar, Settings
 * - Responsive design and loading states
 * - Analytics tracking and error handling
 * - Role-based access control
 */
const Dashboard = memo(() => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { user } = useAuth();
  
  // Get context from TeamSpace parent component
  const contextValue = useOutletContext();
  const {
    currentTeam,
    isManager,
    teamMembers,
    isLoading: contextLoading,
    error: contextError,
    refreshTeamData,
    clearError,
    currentPage
  } = contextValue || {};
  
  // Use TeamContext as fallback
  const { 
    currentTeam: teamContextTeam, 
    isManager: teamContextIsManager,
    teamMembers: teamContextMembers,
    loading: teamContextLoading,
    error: teamContextError,
    refreshCurrentTeam
  } = useTeam();

  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Determine data source (context vs TeamContext)
  const team = currentTeam || teamContextTeam;
  const manager = isManager !== undefined ? isManager : teamContextIsManager;
  const members = teamMembers || teamContextMembers;
  const teamLoading = contextLoading !== undefined ? contextLoading : teamContextLoading;
  const teamError = contextError || teamContextError;

  /**
   * Dashboard statistics calculation
   */
  const stats = useMemo(() => {
    if (!team || !members) return null;

    return {
      totalMembers: members.length,
      activePlayers: members.filter(member => member.status === 'active').length,
      pendingRequests: members.filter(member => member.status === 'pending').length,
      upcomingMatches: 0, // TODO: Implement when matches data is available
      lastActivity: team.lastActivity || team.updatedAt
    };
  }, [team, members]);

  /**
   * Handle dashboard refresh
   */
  const handleRefresh = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // Use context refresh function if available
      if (refreshTeamData && typeof refreshTeamData === 'function') {
        await refreshTeamData();
      } else {
        await refreshCurrentTeam();
      }
      
      setLastRefresh(new Date());
      
      // Analytics tracking
      if (window.gtag) {
        window.gtag('event', 'dashboard_refresh', {
          team_id: team?.id,
          user_role: manager ? 'manager' : 'member',
          timestamp: new Date().toISOString()
        });
      }
    } catch (refreshError) {
      console.error('Dashboard: Error refreshing data:', refreshError);
      setError(refreshError.message || 'Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  }, [loading, refreshTeamData, refreshCurrentTeam, team?.id, manager]);

  /**
   * Handle navigation from dashboard grid
   */
  const handleNavigate = useCallback((path, card) => {
    if (!team?.id) {
      console.warn('Dashboard: No team ID available for navigation');
      return;
    }

    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'dashboard_navigation', {
        card_id: card.id,
        card_title: card.title,
        target_path: path,
        team_id: team.id,
        user_role: manager ? 'manager' : 'member'
      });
    }

    // Navigate to the target page
    const targetPath = `/teams/${team.id}/space/${path}`;
    navigate(targetPath);
  }, [team?.id, manager, navigate]);

  /**
   * Clear error function
   */
  const handleClearError = useCallback(() => {
    setError(null);
    if (clearError && typeof clearError === 'function') {
      clearError();
    }
  }, [clearError]);

  /**
   * Initialize dashboard data
   */
  useEffect(() => {
    const initializeDashboard = async () => {
      if (!team || !user) return;

      try {
        setLoading(true);
        
        // Initialize dashboard stats
        setDashboardStats({
          lastViewed: new Date().toISOString(),
          viewCount: parseInt(localStorage.getItem(`dashboard_views_${team.id}`) || '0') + 1,
          userRole: manager ? 'manager' : 'member'
        });

        // Update view count in localStorage
        localStorage.setItem(`dashboard_views_${team.id}`, dashboardStats?.viewCount?.toString() || '1');

        // Track page view
        if (window.gtag) {
          window.gtag('event', 'page_view', {
            page_title: 'Team Dashboard',
            page_location: window.location.pathname,
            team_id: team.id,
            team_name: team.name,
            user_role: manager ? 'manager' : 'member'
          });
        }
      } catch (initError) {
        console.error('Dashboard: Error initializing:', initError);
        setError('Failed to initialize dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [team, user, manager]);

  /**
   * Document title update
   */
  useEffect(() => {
    if (team?.name) {
      document.title = `Dashboard - ${team.name} | eSkore`;
    }

    return () => {
      document.title = 'eSkore';
    };
  }, [team?.name]);

  /**
   * Loading state
   */
  if (teamLoading && !team) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <h3>Loading Dashboard...</h3>
          <p>Setting up your team workspace</p>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if ((teamError || error) && !team) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <div className="error-content">
            <h3>Error Loading Dashboard</h3>
            <p>{teamError || error || 'Something went wrong loading the dashboard.'}</p>
            <div className="error-actions">
              <button onClick={handleRefresh} className="retry-button" disabled={loading}>
                {loading ? 'Retrying...' : 'Retry'}
              </button>
              <button onClick={() => navigate('/teams')} className="back-button">
                Back to Teams
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * No team state
   */
  if (!team) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-empty">
          <div className="empty-content">
            <div className="empty-icon">🏆</div>
            <h3>No Team Selected</h3>
            <p>Please select a team to view the dashboard</p>
            <button onClick={() => navigate('/teams')} className="select-team-button">
              Select Team
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Team Header Section */}
      <div className="dashboard-header-section">
        <TeamHeader
          team={team}
          showLogo={true}
          showMeta={true}
          showActions={manager}
          onRefresh={handleRefresh}
          onSettings={() => handleNavigate('settings', { id: 'settings', title: 'Settings' })}
          loading={loading || teamLoading}
          size="large"
          layout="horizontal"
          trackAnalytics={true}
        />
      </div>

      {/* Error notification */}
      {(error || teamError) && (
        <div className="dashboard-error-notification">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error || teamError}</span>
            <button onClick={handleClearError} className="error-dismiss">×</button>
          </div>
        </div>
      )}

      {/* Navigation Grid Section */}
      <div className="dashboard-navigation-section">
        <DashboardGrid
          onNavigate={handleNavigate}
          trackAnalytics={true}
          className="dashboard-main-grid"
        />
      </div>

      {/* Loading overlay for refresh */}
      {loading && team && (
        <div className="dashboard-loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner small"></div>
            <span>Refreshing...</span>
          </div>
        </div>
      )}

      {/* Dashboard metadata */}
      {lastRefresh && (
        <div className="dashboard-metadata">
          <p className="last-refresh">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
});

// Display name for debugging
Dashboard.displayName = 'Dashboard';

// PropTypes
Dashboard.propTypes = {
  className: PropTypes.string,
  onNavigate: PropTypes.func,
  trackAnalytics: PropTypes.bool
};

export default Dashboard;

// Named exports for specialized dashboard variants
export const ManagerDashboard = (props) => (
  <Dashboard {...props} />
);

export const PlayerDashboard = (props) => (
  <Dashboard {...props} />
);

// Hook for dashboard state management
export const useDashboard = () => {
  const { currentTeam, isManager, teamMembers } = useTeam();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  const calculateStats = useCallback(() => {
    if (!currentTeam || !teamMembers) return null;

    return {
      totalMembers: teamMembers.length,
      activePlayers: teamMembers.filter(member => member.status === 'active').length,
      pendingRequests: teamMembers.filter(member => member.status === 'pending').length,
      lastActivity: currentTeam.lastActivity || currentTeam.updatedAt
    };
  }, [currentTeam, teamMembers]);

  useEffect(() => {
    const newStats = calculateStats();
    setStats(newStats);
  }, [calculateStats]);

  return {
    team: currentTeam,
    isManager,
    members: teamMembers,
    stats,
    refreshing,
    setRefreshing
  };
};