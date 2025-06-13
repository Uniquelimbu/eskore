import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTeamSpace } from '../contexts/TeamSpaceContext';
import { useTeam } from '../../../../../contexts/TeamContext';
import TeamSpaceBreadcrumb from './TeamSpaceBreadcrumb';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';

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
    className
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'layout-content',
    contentClassName
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Breadcrumb Navigation */}
      {showBreadcrumb && (
        <div className="breadcrumb-section">
          <TeamSpaceBreadcrumb 
            team={currentTeam}
            showTeamLogo={true}
            showIcons={true}
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

      {/* Layout Styles */}
      <style jsx>{`
        .team-space-layout-wrapper {
          min-height: 100vh;
          background-color: var(--bg-dark, #1a202c);
          color: var(--text-light, #e2e8f0);
          position: relative;
        }

        /* Background variants */
        .background-transparent {
          background-color: transparent;
        }

        .background-card {
          background-color: var(--card-bg, #232b3a);
          border-radius: 12px;
          margin: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        /* Layout variants */
        .layout-default {
          max-width: ${fullWidth ? '100%' : maxWidth};
          margin: 0 auto;
          padding: 0 20px;
        }

        .layout-centered {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
          text-align: center;
        }

        .layout-split {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 32px;
          max-width: ${maxWidth};
          margin: 0 auto;
          padding: 0 20px;
        }

        .layout-dashboard {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          max-width: ${maxWidth};
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Spacing variants */
        .spacing-compact {
          padding: 0 12px;
        }

        .spacing-compact .layout-content {
          padding: 16px 0;
        }

        .spacing-default .layout-content {
          padding: 24px 0;
        }

        .spacing-spacious .layout-content {
          padding: 40px 0;
        }

        /* Breadcrumb section */
        .breadcrumb-section {
          padding: 16px 0 0 0;
        }

        /* Team info section */
        .team-info-section {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 0;
          border-bottom: 1px solid var(--border-color, #2d3748);
          margin-bottom: 24px;
        }

        .team-logo-container {
          position: relative;
        }

        .team-logo-img {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid var(--border-color, #2d3748);
        }

        .team-logo-placeholder {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary-color, #4a6cf7), var(--primary-dark, #3a5bd9));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          color: white;
          border: 2px solid var(--border-color, #2d3748);
        }

        .team-details {
          flex: 1;
        }

        .team-name {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: var(--text-light, #e2e8f0);
        }

        .team-location {
          font-size: 1rem;
          color: var(--text-muted, #a0aec0);
          margin: 0 0 8px 0;
        }

        .user-role-badge {
          display: inline-block;
          background-color: var(--primary-color, #4a6cf7);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Header */
        .layout-header {
          padding: 24px 0;
          border-bottom: 1px solid var(--border-color, #2d3748);
          margin-bottom: 32px;
          transition: all 0.3s ease;
        }

        .layout-header.sticky {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: var(--bg-dark, #1a202c);
          backdrop-filter: blur(8px);
        }

        .layout-header.scrolled {
          border-bottom-color: var(--primary-color, #4a6cf7);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .header-main {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .page-title-section {
          flex: 1;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: var(--text-light, #e2e8f0);
        }

        .page-subtitle {
          font-size: 1rem;
          color: var(--text-muted, #a0aec0);
          margin: 0;
        }

        .page-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* Main content */
        .layout-content {
          flex: 1;
          width: 100%;
        }

        /* Scroll to top button */
        .scroll-to-top-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          background-color: var(--primary-color, #4a6cf7);
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(74, 108, 247, 0.3);
          transition: all 0.3s ease;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scroll-to-top-btn:hover {
          background-color: var(--primary-dark, #3a5bd9);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(74, 108, 247, 0.4);
        }

        .scroll-to-top-btn:active {
          transform: translateY(0);
        }

        /* Responsive design */
        @media (max-width: 992px) {
          .layout-split {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .layout-default,
          .layout-centered,
          .layout-dashboard {
            padding: 0 16px;
          }

          .team-info-section {
            padding: 16px 0;
          }

          .team-logo-img,
          .team-logo-placeholder {
            width: 56px;
            height: 56px;
          }

          .team-name {
            font-size: 1.5rem;
          }

          .page-title {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .header-main {
            width: 100%;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .page-meta {
            width: 100%;
            justify-content: flex-start;
          }

          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .team-info-section {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }

          .team-details {
            width: 100%;
          }

          .scroll-to-top-btn {
            bottom: 16px;
            right: 16px;
            width: 44px;
            height: 44px;
          }
        }

        @media (max-width: 576px) {
          .layout-default,
          .layout-centered,
          .layout-dashboard {
            padding: 0 12px;
          }

          .breadcrumb-section {
            padding: 12px 0 0 0;
          }

          .layout-header {
            padding: 16px 0;
            margin-bottom: 24px;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .team-logo-img,
          .team-logo-placeholder {
            width: 48px;
            height: 48px;
          }

          .team-name {
            font-size: 1.3rem;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .layout-header {
            border-bottom-width: 2px;
          }

          .team-info-section {
            border-bottom-width: 2px;
          }

          .scroll-to-top-btn {
            border: 2px solid #ffffff;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .layout-header,
          .scroll-to-top-btn {
            transition: none;
          }

          .scroll-to-top-btn:hover {
            transform: none;
          }

          .scroll-to-top-btn:active {
            transform: none;
          }
        }

        /* Print styles */
        @media print {
          .scroll-to-top-btn,
          .breadcrumb-section {
            display: none;
          }

          .layout-header {
            position: static;
            box-shadow: none;
            border-bottom: 1px solid #000;
          }

          .team-space-layout-wrapper {
            background-color: transparent;
          }
        }
      `}</style>
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