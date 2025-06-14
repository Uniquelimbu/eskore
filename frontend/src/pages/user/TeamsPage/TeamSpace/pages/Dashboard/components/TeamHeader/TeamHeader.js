import React, { memo, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../../../../../../../../contexts/TeamContext';
import './TeamHeader.css';

/**
 * TeamHeader Component
 * 
 * Industry-standard team header component for dashboard display.
 * Features team logo, name, metadata, and manager actions.
 * Consolidates team display logic from TeamSpace.js into reusable component.
 * 
 * @param {Object} team - Team object (optional, uses context if not provided)
 * @param {boolean} showLogo - Whether to display team logo
 * @param {boolean} showMeta - Whether to display team metadata
 * @param {boolean} showActions - Whether to display action buttons
 * @param {React.Node} customActions - Custom action buttons
 * @param {Function} onRefresh - Custom refresh callback
 * @param {Function} onEdit - Edit team callback
 * @param {Function} onSettings - Navigate to settings callback
 * @param {string} layout - Layout variant (horizontal, vertical, compact)
 * @param {string} size - Size variant (small, medium, large)
 * @param {boolean} loading - Loading state
 * @param {boolean} interactive - Enable hover effects and interactions
 * @param {string} className - Additional CSS classes
 * @param {boolean} trackAnalytics - Enable analytics tracking
 */
const TeamHeader = memo(({
  team = null,
  showLogo = true,
  showMeta = true,
  showActions = true,
  customActions = null,
  onRefresh = null,
  onEdit = null,
  onSettings = null,
  layout = 'horizontal',
  size = 'large',
  loading = false,
  interactive = true,
  className = '',
  trackAnalytics = true
}) => {
  const navigate = useNavigate();
  const { 
    currentTeam, 
    isManager, 
    teamMembers, 
    refreshCurrentTeam,
    getTeamDisplayName,
    getTeamAbbreviation
  } = useTeam();

  // Use provided team or fallback to current team
  const displayTeam = team || currentTeam;
  
  // Local state
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Team metadata calculations
   */
  const teamData = useMemo(() => {
    if (!displayTeam) return null;

    return {
      name: getTeamDisplayName(displayTeam),
      abbreviation: getTeamAbbreviation(displayTeam),
      memberCount: teamMembers?.length || 0,
      foundedYear: displayTeam.foundedYear,
      city: displayTeam.city,
      nickname: displayTeam.nickname,
      logoUrl: displayTeam.logoUrl
    };
  }, [displayTeam, getTeamDisplayName, getTeamAbbreviation, teamMembers]);

  /**
   * Handle logo load success
   */
  const handleLogoLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  /**
   * Handle logo load error
   */
  const handleLogoError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  /**
   * Handle refresh action
   */
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    // Analytics tracking
    if (trackAnalytics && window.gtag) {
      window.gtag('event', 'team_header_refresh', {
        team_id: displayTeam?.id,
        team_name: displayTeam?.name,
        user_role: isManager ? 'manager' : 'member'
      });
    }

    setRefreshing(true);
    
    try {
      if (onRefresh && typeof onRefresh === 'function') {
        await onRefresh();
      } else {
        await refreshCurrentTeam();
      }
    } catch (error) {
      console.error('TeamHeader: Error refreshing team data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, onRefresh, refreshCurrentTeam, trackAnalytics, displayTeam, isManager]);

  /**
   * Handle edit team action
   */
  const handleEdit = useCallback(() => {
    if (trackAnalytics && window.gtag) {
      window.gtag('event', 'team_header_edit', {
        team_id: displayTeam?.id,
        team_name: displayTeam?.name
      });
    }

    if (onEdit && typeof onEdit === 'function') {
      onEdit(displayTeam);
    } else if (displayTeam?.id) {
      navigate(`/teams/${displayTeam.id}/edit`);
    }
  }, [onEdit, displayTeam, navigate, trackAnalytics]);

  /**
   * Handle settings navigation
   */
  const handleSettings = useCallback(() => {
    if (trackAnalytics && window.gtag) {
      window.gtag('event', 'team_header_settings', {
        team_id: displayTeam?.id,
        team_name: displayTeam?.name
      });
    }

    if (onSettings && typeof onSettings === 'function') {
      onSettings(displayTeam);
    } else if (displayTeam?.id) {
      navigate(`/teams/${displayTeam.id}/space/settings`);
    }
  }, [onSettings, displayTeam, navigate, trackAnalytics]);

  /**
   * Handle team logo click for full view
   */
  const handleLogoClick = useCallback(() => {
    if (!interactive || !teamData?.logoUrl) return;

    if (trackAnalytics && window.gtag) {
      window.gtag('event', 'team_logo_click', {
        team_id: displayTeam?.id,
        has_logo: !!teamData.logoUrl
      });
    }

    // Could open logo in modal or larger view
    console.log('TeamHeader: Logo clicked', teamData.logoUrl);
  }, [interactive, teamData?.logoUrl, trackAnalytics, displayTeam]);

  /**
   * Render team logo
   */
  const renderLogo = useCallback(() => {
    if (!showLogo) return null;

    return (
      <div 
        className={`team-header-logo-container ${interactive ? 'interactive' : ''}`}
        onClick={handleLogoClick}
        role={interactive && teamData?.logoUrl ? 'button' : undefined}
        tabIndex={interactive && teamData?.logoUrl ? 0 : undefined}
        aria-label={interactive && teamData?.logoUrl ? 'View team logo' : undefined}
      >
        {teamData?.logoUrl && !imageError ? (
          <>
            <img 
              src={teamData.logoUrl}
              alt={`${teamData.name} logo`}
              className={`team-header-logo ${imageLoaded ? 'loaded' : 'loading'}`}
              onLoad={handleLogoLoad}
              onError={handleLogoError}
              draggable={false}
            />
            {!imageLoaded && (
              <div className="team-header-logo-placeholder loading">
                <div className="loading-spinner"></div>
              </div>
            )}
          </>
        ) : (
          <div className="team-header-logo-placeholder">
            <span className="team-abbreviation" aria-label="Team abbreviation">
              {teamData?.abbreviation || 'T'}
            </span>
          </div>
        )}
      </div>
    );
  }, [showLogo, teamData, imageError, imageLoaded, interactive, handleLogoClick, handleLogoLoad, handleLogoError]);

  /**
   * Render team information
   */
  const renderTeamInfo = useCallback(() => {
    if (!teamData) return null;

    return (
      <div className="team-header-info">
        <div className="team-header-name-section">
          <h1 className="team-header-name" title={teamData.name}>
            {teamData.name}
          </h1>
          {teamData.nickname && (
            <span className="team-header-nickname" title="Team nickname">
              "{teamData.nickname}"
            </span>
          )}
        </div>
        
        {showMeta && (
          <div className="team-header-meta">
            {teamData.city && (
              <span className="team-meta-item team-location" title="Team location">
                <span className="meta-icon" aria-hidden="true">📍</span>
                {teamData.city}
              </span>
            )}
            {teamData.foundedYear && (
              <span className="team-meta-item team-founded" title="Founded year">
                <span className="meta-icon" aria-hidden="true">📅</span>
                Est. {teamData.foundedYear}
              </span>
            )}
            <span className="team-meta-item team-members" title="Team members">
              <span className="meta-icon" aria-hidden="true">👥</span>
              {teamData.memberCount} member{teamData.memberCount !== 1 ? 's' : ''}
            </span>
            {isManager && (
              <span className="team-meta-item user-role manager" title="Your role">
                <span className="meta-icon" aria-hidden="true">👑</span>
                Manager
              </span>
            )}
          </div>
        )}
      </div>
    );
  }, [teamData, showMeta, isManager]);

  /**
   * Render action buttons
   */
  const renderActions = useCallback(() => {
    if (!showActions && !customActions) return null;

    return (
      <div className="team-header-actions">
        {customActions || (
          <>
            {isManager && (
              <>
                <button
                  className="team-action-btn refresh-btn"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  title="Refresh team data"
                  aria-label="Refresh team data"
                >
                  <span className="btn-icon" aria-hidden="true">
                    {refreshing ? '⟳' : '🔄'}
                  </span>
                  <span className="btn-text">
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </span>
                </button>
                
                <button
                  className="team-action-btn settings-btn"
                  onClick={handleSettings}
                  disabled={loading}
                  title="Team settings"
                  aria-label="Open team settings"
                >
                  <span className="btn-icon" aria-hidden="true">⚙️</span>
                  <span className="btn-text">Settings</span>
                </button>
              </>
            )}
          </>
        )}
      </div>
    );
  }, [showActions, customActions, isManager, handleRefresh, handleSettings, refreshing, loading]);

  // Don't render if no team data
  if (!teamData) {
    return (
      <div className="team-header-empty">
        <div className="team-header-empty-content">
          <div className="empty-icon" aria-hidden="true">🏆</div>
          <h3>No Team Selected</h3>
          <p>Please select a team to view details</p>
        </div>
      </div>
    );
  }

  // CSS classes
  const headerClasses = [
    'team-header',
    `team-header--${layout}`,
    `team-header--${size}`,
    loading ? 'team-header--loading' : '',
    interactive ? 'team-header--interactive' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses} role="banner">
      {layout === 'vertical' ? (
        <div className="team-header-content vertical">
          <div className="team-header-primary">
            {renderLogo()}
            {renderTeamInfo()}
          </div>
          {renderActions()}
        </div>
      ) : (
        <div className="team-header-content horizontal">
          {renderLogo()}
          <div className="team-header-main">
            {renderTeamInfo()}
          </div>
          {renderActions()}
        </div>
      )}
      
      {/* Loading overlay */}
      {loading && (
        <div className="team-header-loading-overlay" aria-hidden="true">
          <div className="loading-spinner"></div>
        </div>
      )}
    </header>
  );
});

// Display name for debugging
TeamHeader.displayName = 'TeamHeader';

// PropTypes
TeamHeader.propTypes = {
  team: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    nickname: PropTypes.string,
    logoUrl: PropTypes.string,
    abbreviation: PropTypes.string,
    city: PropTypes.string,
    foundedYear: PropTypes.number
  }),
  showLogo: PropTypes.bool,
  showMeta: PropTypes.bool,
  showActions: PropTypes.bool,
  customActions: PropTypes.node,
  onRefresh: PropTypes.func,
  onEdit: PropTypes.func,
  onSettings: PropTypes.func,
  layout: PropTypes.oneOf(['horizontal', 'vertical', 'compact']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  loading: PropTypes.bool,
  interactive: PropTypes.bool,
  className: PropTypes.string,
  trackAnalytics: PropTypes.bool
};

export default TeamHeader;

// Named exports for layout variants
export const HorizontalTeamHeader = (props) => (
  <TeamHeader {...props} layout="horizontal" />
);

export const VerticalTeamHeader = (props) => (
  <TeamHeader {...props} layout="vertical" />
);

export const CompactTeamHeader = (props) => (
  <TeamHeader {...props} layout="compact" showMeta={false} size="small" />
);

// Hook for team header state management
export const useTeamHeader = (teamId) => {
  const { currentTeam, isManager, teamMembers, refreshCurrentTeam } = useTeam();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshCurrentTeam();
    } catch (error) {
      console.error('useTeamHeader: Error refreshing team:', error);
      throw error;
    } finally {
      setRefreshing(false);
    }
  }, [refreshCurrentTeam]);

  return {
    team: currentTeam,
    isManager,
    memberCount: teamMembers?.length || 0,
    refreshing,
    refresh
  };
};