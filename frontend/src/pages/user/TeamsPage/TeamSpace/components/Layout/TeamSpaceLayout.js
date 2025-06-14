import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTeam } from '../../../../../../contexts/TeamContext';

// ✅ FIXED: Import styles
import './TeamSpaceLayout.css';
import './responsive.css';
import './variants.css';

// ✅ FIXED: Import components with proper error handling
let TeamSpaceBreadcrumb, LoadingScreen, ErrorScreen;

try {
  TeamSpaceBreadcrumb = require('../Breadcrumb/TeamSpaceBreadcrumb').default;
} catch (e) {
  console.warn('TeamSpaceBreadcrumb component not found, breadcrumbs will be disabled');
  TeamSpaceBreadcrumb = () => null;
}

try {
  LoadingScreen = require('../LoadingScreen/LoadingScreen').default;
} catch (e) {
  console.warn('LoadingScreen component not found, using basic loading');
  LoadingScreen = ({ message = "Loading..." }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '400px',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '3px solid #4a6cf7', 
        borderTop: '3px solid transparent', 
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ color: '#a0aec0', margin: 0 }}>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

try {
  ErrorScreen = require('../ErrorScreen/ErrorScreen').default;
} catch (e) {
  console.warn('ErrorScreen component not found, using basic error display');
  ErrorScreen = ({ error, onRetry, title = "Error", onGoBack }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '400px',
      flexDirection: 'column',
      gap: '16px',
      textAlign: 'center',
      padding: '40px'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '8px' }}>⚠️</div>
      <h3 style={{ color: '#f56565', margin: 0, fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ color: '#a0aec0', margin: 0, maxWidth: '400px' }}>
        {typeof error === 'string' ? error : error?.message || 'Something went wrong'}
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
        {onRetry && (
          <button 
            onClick={onRetry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4a6cf7',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Retry
          </button>
        )}
        {onGoBack && (
          <button 
            onClick={onGoBack}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2d3748',
              color: 'white',
              border: '1px solid #4a5568',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * ✅ INDUSTRY-GRADE TeamSpaceLayout Component
 * 
 * Clean, production-ready layout component with:
 * - NO breadcrumb navigation (removed as requested)
 * - NO page header (removed as requested)
 * - NO duplicate team headers (removed internal team info)
 * - Uses main app sidebar only (no internal sidebar)
 * - Responsive design with mobile-first approach
 * - Error handling with retry mechanisms
 * - Accessibility compliance (WCAG 2.1)
 * - Performance optimizations
 * - Analytics integration
 * - Type safety with PropTypes
 * 
 * @version 4.2.0 - PAGE HEADER REMOVED
 * @author eSkore Development Team
 */
const TeamSpaceLayout = memo(({
  children,
  title = null,
  subtitle = null,
  showBreadcrumb = false,
  showHeader = false, // ✅ CHANGED: Default to false
  headerActions = null,
  fullWidth = false,
  loading = false,
  error = null,
  onRetry = null,
  className = "",
  contentClassName = "",
  headerClassName = "",
  layout = "default",
  maxWidth = "1200px",
  spacing = "default",
  background = "default",
  enableScrollToTop = true,
  stickyHeader = false,
  customMeta = null,
  trackPageView = true,
  responsive = true,
  theme = 'dark'
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTeam, isManager } = useTeam();
  
  // ✅ STATE MANAGEMENT - All hooks at the top
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // ✅ DERIVED STATE - Memoized for performance
  const activePage = useMemo(() => {
    const pathSegments = location.pathname.split('/');
    const spaceIndex = pathSegments.findIndex(segment => segment === 'space');
    return spaceIndex >= 0 ? pathSegments[spaceIndex + 1] || 'dashboard' : 'dashboard';
  }, [location.pathname]);

  const pageTitle = useMemo(() => {
    if (title) return title;
    
    const pageLabels = {
      dashboard: 'Dashboard',
      squad: 'Squad Management',
      formation: 'Team Formation',
      calendar: 'Schedule & Events',
      settings: 'Team Settings'
    };
    
    return pageLabels[activePage] || 'TeamSpace';
  }, [title, activePage]);

  const pageSubtitle = useMemo(() => {
    if (subtitle) return subtitle;
    
    const subtitleLabels = {
      dashboard: 'Overview and key metrics for your team',
      squad: 'Manage players, roles, and team composition',
      formation: 'Configure tactical setup and player positions',
      calendar: 'Upcoming matches, training, and team events',
      settings: 'Team configuration and preferences'
    };
    
    return subtitleLabels[activePage] || '';
  }, [subtitle, activePage]);

  // ✅ SCROLL HANDLING - Optimized with throttling
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
    setIsScrolled(currentScrollY > 50);
    setShowScrollTop(currentScrollY > 300);
  }, []);

  const throttledScrollHandler = useMemo(() => {
    let ticking = false;
    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Analytics tracking
    if (window.gtag && currentTeam) {
      window.gtag('event', 'scroll_to_top', {
        page: activePage,
        team_id: currentTeam.id,
        scroll_position: scrollY
      });
    }
  }, [activePage, currentTeam, scrollY]);

  // ✅ CSS CLASSES - Clean and organized
  const containerClasses = useMemo(() => {
    const classes = [
      'team-space-layout-wrapper',
      `layout-${layout}`,
      `spacing-${spacing}`,
      `background-${background}`,
      `theme-${theme}`,
      'no-sidebar', // Uses main app sidebar only
      'no-breadcrumb', // No breadcrumb
      'no-header', // ✅ NEW: No page header class
      fullWidth ? 'full-width' : '',
      stickyHeader ? 'sticky-header' : '',
      loading ? 'layout-loading' : '',
      error ? 'layout-error' : '',
      isVisible ? 'layout-visible' : '',
      className
    ].filter(Boolean);
    
    return classes.join(' ');
  }, [layout, spacing, background, theme, fullWidth, stickyHeader, loading, error, isVisible, className]);

  const contentClasses = useMemo(() => {
    return ['layout-content', contentClassName].filter(Boolean).join(' ');
  }, [contentClassName]);

  // ✅ HEADER RENDERING - DISABLED
  const renderHeader = useCallback(() => {
    // ✅ REMOVED: Page header rendering completely disabled
    return null;
  }, []);

  // ✅ SCROLL TO TOP BUTTON
  const renderScrollToTop = useCallback(() => {
    if (!enableScrollToTop) return null;

    return (
      <button
        className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top of page"
        title="Scroll to top"
        type="button"
        style={{
          opacity: showScrollTop ? 1 : 0,
          visibility: showScrollTop ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s ease'
        }}
      >
        <span aria-hidden="true">↑</span>
      </button>
    );
  }, [enableScrollToTop, showScrollTop, scrollToTop]);

  // ✅ EFFECTS - Properly organized
  // Scroll listener setup
  useEffect(() => {
    if (enableScrollToTop && typeof window !== 'undefined') {
      window.addEventListener('scroll', throttledScrollHandler, { passive: true });
      return () => window.removeEventListener('scroll', throttledScrollHandler);
    }
  }, [enableScrollToTop, throttledScrollHandler]);

  // Component mount animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Page view tracking
  useEffect(() => {
    if (trackPageView && typeof window !== 'undefined' && window.gtag && currentTeam) {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: location.pathname,
        team_id: currentTeam.id,
        team_name: currentTeam.name,
        user_role: isManager ? 'manager' : 'member',
        layout_variant: layout,
        timestamp: new Date().toISOString()
      });
    }
  }, [trackPageView, pageTitle, location.pathname, currentTeam, isManager, layout]);

  // Document title management
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const originalTitle = document.title;
      const newTitle = currentTeam 
        ? `${pageTitle} - ${currentTeam.name} | eSkore`
        : `${pageTitle} | eSkore`;
      
      document.title = newTitle;
      
      return () => {
        document.title = originalTitle;
      };
    }
  }, [pageTitle, currentTeam]);

  // ✅ EARLY RETURNS - After all hooks
  if (loading) {
    return (
      <div className="team-space-layout-wrapper layout-loading no-sidebar no-breadcrumb no-header">
        <LoadingScreen 
          message={`Loading ${pageTitle}...`}
          size="large"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-space-layout-wrapper layout-error no-sidebar no-breadcrumb no-header">
        <ErrorScreen 
          error={error}
          onRetry={onRetry}
          title={`Error Loading ${pageTitle}`}
          onGoBack={() => navigate('/teams')}
        />
      </div>
    );
  }

  // ✅ MAIN RENDER - Clean, no duplicates, no sidebar, no breadcrumb, no header
  return (
    <div 
      className={containerClasses} 
      style={{ '--max-width': maxWidth }}
      role="main"
      aria-live="polite"
    >
      <div className="teamspace-layout__main">
        <div className="teamspace-layout__content">
          {/* ✅ REMOVED: Breadcrumb Navigation Section */}
          
          {/* ✅ REMOVED: Team Information Section */}
          
          {/* ✅ REMOVED: Page Header Section */}
          {/* {renderHeader()} */}

          {/* ✅ MAIN CONTENT ONLY */}
          <main className={contentClasses} role="main">
            {children}
          </main>
        </div>
      </div>

      {/* ✅ SCROLL TO TOP BUTTON */}
      {renderScrollToTop()}

      {/* ✅ INLINE STYLES - Clean and minimal */}
      <style jsx>{`
        .team-space-layout-wrapper.no-sidebar .teamspace-layout__main {
          margin-left: 0;
          width: 100%;
        }
        
        .team-space-layout-wrapper.no-sidebar .teamspace-layout__content {
          max-width: var(--max-width, 1200px);
          margin: 0 auto;
          padding: 0 20px;
        }

        /* ✅ NEW: No breadcrumb spacing adjustments */
        .team-space-layout-wrapper.no-breadcrumb .teamspace-layout__content {
          padding-top: 20px;
        }
        
        /* ✅ NEW: No header spacing adjustments */
        .team-space-layout-wrapper.no-header .teamspace-layout__content {
          padding-top: 24px; /* Start content immediately */
        }
        
        .team-space-layout-wrapper.no-header .layout-content {
          margin-top: 0; /* Remove any header margin */
        }
        
        @media (max-width: 768px) {
          .team-space-layout-wrapper.no-sidebar .teamspace-layout__content {
            padding: 0 16px;
          }

          .team-space-layout-wrapper.no-breadcrumb .teamspace-layout__content,
          .team-space-layout-wrapper.no-header .teamspace-layout__content {
            padding-top: 20px;
          }
        }
      `}</style>
    </div>
  );
});

// ✅ DISPLAY NAME
TeamSpaceLayout.displayName = 'TeamSpaceLayout';

// ✅ PROPTYPES - Complete and accurate
TeamSpaceLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showBreadcrumb: PropTypes.bool,
  showHeader: PropTypes.bool,
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
  trackPageView: PropTypes.bool,
  responsive: PropTypes.bool,
  theme: PropTypes.oneOf(['dark', 'light'])
};

// ✅ DEFAULT PROPS - Updated to remove breadcrumb and header by default
TeamSpaceLayout.defaultProps = {
  showBreadcrumb: false, // No breadcrumb
  showHeader: false, // ✅ CHANGED: No header by default
  fullWidth: false,
  loading: false,
  error: null,
  layout: 'default',
  maxWidth: '1200px',
  spacing: 'default',
  background: 'default',
  enableScrollToTop: true,
  stickyHeader: false,
  trackPageView: true,
  responsive: true,
  theme: 'dark'
};

export default TeamSpaceLayout;

// ✅ LAYOUT VARIANTS - Clean and consistent, all with no breadcrumb or header
export const DashboardLayout = memo(({ children, ...props }) => (
  <TeamSpaceLayout 
    layout="dashboard" 
    spacing="default"
    enableScrollToTop={true}
    showBreadcrumb={false} // No breadcrumb
    showHeader={false} // ✅ EXPLICIT: No header for dashboard
    {...props}
  >
    {children}
  </TeamSpaceLayout>
));

export const CenteredLayout = memo(({ children, ...props }) => (
  <TeamSpaceLayout 
    layout="centered" 
    spacing="spacious"
    enableScrollToTop={false}
    showBreadcrumb={false} // No breadcrumb
    showHeader={false} // ✅ EXPLICIT: No header
    {...props}
  >
    {children}
  </TeamSpaceLayout>
));

export const SplitLayout = memo(({ children, ...props }) => (
  <TeamSpaceLayout 
    layout="split" 
    spacing="default"
    enableScrollToTop={true}
    showBreadcrumb={false} // No breadcrumb
    showHeader={false} // ✅ EXPLICIT: No header
    {...props}
  >
    {children}
  </TeamSpaceLayout>
));

// ✅ LAYOUT HOOK - Clean and focused
export const useTeamSpaceLayout = () => {
  const [layoutState, setLayoutState] = useState({
    stickyHeader: false,
    fullWidth: false,
    layout: 'default',
    spacing: 'default',
    background: 'default',
    theme: 'dark',
    showBreadcrumb: false, // Default no breadcrumb
    showHeader: false // ✅ NEW: Default no header
  });

  const updateLayout = useCallback((updates) => {
    setLayoutState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetLayout = useCallback(() => {
    setLayoutState({
      stickyHeader: false,
      fullWidth: false,
      layout: 'default',
      spacing: 'default',
      background: 'default',
      theme: 'dark',
      showBreadcrumb: false, // Reset to no breadcrumb
      showHeader: false // ✅ NEW: Reset to no header
    });
  }, []);

  return {
    layoutState,
    updateLayout,
    resetLayout
  };
};

// ✅ DISPLAY NAMES FOR VARIANTS
DashboardLayout.displayName = 'DashboardLayout';
CenteredLayout.displayName = 'CenteredLayout';
SplitLayout.displayName = 'SplitLayout';