import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTeamSpace } from '../../contexts/TeamSpaceContext';
import { useTeam } from '../../../../../../contexts/TeamContext';
import TeamSpaceBreadcrumb from '../Breadcrumb/TeamSpaceBreadcrumb';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import ErrorScreen from '../ErrorScreen/ErrorScreen';

// Import CSS files
import './TeamSpaceLayout.css';
import './responsive.css';
import './variants.css';

/**
 * Industry-standard Layout Component for TeamSpace
 * Features: Responsive design, loading states, error handling, accessibility, performance optimization
 */
const TeamSpaceLayout = memo(({
  children,
  title = null,
  subtitle = null,
  showBreadcrumb = true,
  showHeader = true,
  showTeamInfo = true,
  headerActions = null,
  fullWidth = false,
  loading = false,
  error = null,
  onRetry = null,
  className = "",
  contentClassName = "",
  headerClassName = "",
  layout = "default", // default, centered, split, dashboard
  maxWidth = "1200px",
  spacing = "default", // compact, default, spacious
  background = "default", // default, transparent, card
  enableScrollToTop = true,
  stickyHeader = false,
  customMeta = null,
  trackPageView = true
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTeam, isManager } = useTeam();
  const { activePage } = useTeamSpace();
  
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Page metadata
  const pageTitle = useMemo(() => {
    if (title) return title;
    
    const pageLabels = {
      dashboard: 'Dashboard',
      squad: 'Squad',
      formation: 'Formation',
      calendar: 'Calendar',
      settings: 'Settings'
    };
    
    return pageLabels[activePage] || 'TeamSpace';
  }, [title, activePage]);

  const pageSubtitle = useMemo(() => {
    if (subtitle) return subtitle;
    if (currentTeam?.name) return currentTeam.name;
    return null;
  }, [subtitle, currentTeam?.name]);

  // Scroll handling
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY;
    setScrollY(scrolled);
    setIsScrolled(scrolled > 10);
    setShowScrollTop(scrolled > 400);
  }, []);

  useEffect(() => {
    if (enableScrollToTop) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [enableScrollToTop, handleScroll]);

  // Page view tracking
  useEffect(() => {
    if (trackPageView && window.gtag && currentTeam) {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: location.pathname,
        team_id: currentTeam.id,
        user_role: isManager ? 'manager' : 'member'
      });
    }
  }, [location.pathname, pageTitle, trackPageView, currentTeam, isManager]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  /**
   * Render team information section
   */
  const renderTeamInfo = () => {
    if (!showTeamInfo || !currentTeam) return null;

    return (
      <div className="team-info-section">
        <div className="team-logo-container">
          {currentTeam.logoUrl ? (
            <img 
              src={currentTeam.logoUrl} 
              alt={`${currentTeam.name} logo`}
              className="team-logo-img"
              loading="lazy"
            />
          ) : (
            <div className="team-logo-placeholder">
              {currentTeam.abbreviation || 
               currentTeam.name?.substring(0, 3).toUpperCase() || 'TM'}
            </div>
          )}
        </div>
        
        <div className="team-details">
          <h1 className="team-name">{currentTeam.name}</h1>
          {currentTeam.city && (
            <p className="team-location">{currentTeam.city}</p>
          )}
          {isManager && (
            <span className="user-role-badge">Manager</span>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render page header
   */
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <header 
        className={`layout-header ${stickyHeader ? 'sticky' : ''} ${isScrolled ? 'scrolled' : ''} ${headerClassName}`}
      >
        <div className="header-content">
          <div className="header-main">
            <div className="page-title-section">
              <h1 className="page-title">{pageTitle}</h1>
              {pageSubtitle && (
                <p className="page-subtitle">{pageSubtitle}</p>
              )}
            </div>
            
            {customMeta && (
              <div className="page-meta">
                {customMeta}
              </div>
            )}
          </div>
          
          {headerActions && (
            <div className="header-actions">
              {headerActions}
            </div>
          )}
        </div>
      </header>
    );
  };

  /**
   * Render scroll to top button
   */
  const renderScrollToTop = () => {
    if (!enableScrollToTop || !showScrollTop) return null;

    return (
      <button
        onClick={scrollToTop}
        className="scroll-to-top-btn"
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 14L12 9L17 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  };

  // Handle loading state
  if (loading) {
    return (
      <LoadingScreen 
        message="Loading page..."
        fullScreen={false}
        size="default"
      />
    );
  }

  // Handle error state
  if (error) {
    return (
      <ErrorScreen 
        error={error}
        onRetry={onRetry}
        fullScreen={false}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  // Container classes
  const containerClasses = [
    'team-space-layout-wrapper',
    `layout-${layout}`,
    `spacing-${spacing}`,
    `background-${background}`,
    fullWidth ? 'full-width' : '',
    stickyHeader ? 'sticky-header' : '',
    loading ? 'layout-loading' : '',
    error ? 'layout-error' : '',
    className
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'layout-content',
    contentClassName
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={{ '--max-width': maxWidth }}>
      {/* Breadcrumb Navigation */}
      {showBreadcrumb && (
        <div className="breadcrumb-section">
          <TeamSpaceBreadcrumb 
            team={currentTeam}
            showTeamLogo={true}
            showIcons={true}
            trackNavigation={true}
            enableKeyboardNavigation={true}
            maxItems={5}
            collapsible={true}
            hideOnSingleItem={false}
            onNavigate={(item, index) => {
              if (window.gtag) {
                window.gtag('event', 'breadcrumb_navigation', {
                  item_label: item.label,
                  item_path: item.path,
                  team_id: currentTeam?.id
                });
              }
              return true;
            }}
          />
        </div>
      )}

      {/* Team Information */}
      {renderTeamInfo()}

      {/* Page Header */}
      {renderHeader()}

      {/* Main Content */}
      <main className={contentClasses} role="main">
        {children}
      </main>

      {/* Scroll to Top Button */}
      {renderScrollToTop()}
    </div>
  );
});

// Display name for debugging
TeamSpaceLayout.displayName = 'TeamSpaceLayout';

// PropTypes
TeamSpaceLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showBreadcrumb: PropTypes.bool,
  showHeader: PropTypes.bool,
  showTeamInfo: PropTypes.bool,
  headerActions: PropTypes.node,
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onRetry: PropTypes.func,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  layout: PropTypes.oneOf(['default', 'centered', 'split', 'dashboard']),
  maxWidth: PropTypes.string,
  spacing: PropTypes.oneOf(['compact', 'default', 'spacious']),
  background: PropTypes.oneOf(['default', 'transparent', 'card']),
  enableScrollToTop: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  customMeta: PropTypes.node,
  trackPageView: PropTypes.bool
};

export default TeamSpaceLayout;

// Convenience layout components
export const DashboardLayout = ({ children, ...props }) => (
  <TeamSpaceLayout 
    layout="dashboard" 
    showTeamInfo={true}
    spacing="default"
    {...props}
  >
    {children}
  </TeamSpaceLayout>
);

export const CenteredLayout = ({ children, ...props }) => (
  <TeamSpaceLayout 
    layout="centered" 
    showTeamInfo={false}
    spacing="spacious"
    {...props}
  >
    {children}
  </TeamSpaceLayout>
);

export const SplitLayout = ({ children, ...props }) => (
  <TeamSpaceLayout 
    layout="split" 
    showTeamInfo={true}
    spacing="default"
    {...props}
  >
    {children}
  </TeamSpaceLayout>
);

// Hook for layout management
export const useTeamSpaceLayout = () => {
  const [layoutState, setLayoutState] = useState({
    stickyHeader: false,
    fullWidth: false,
    layout: 'default',
    spacing: 'default'
  });

  const updateLayout = useCallback((updates) => {
    setLayoutState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetLayout = useCallback(() => {
    setLayoutState({
      stickyHeader: false,
      fullWidth: false,
      layout: 'default',
      spacing: 'default'
    });
  }, []);

  return {
    layoutState,
    updateLayout,
    resetLayout
  };
};