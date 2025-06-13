import React, { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
// ✅ FIXED: Correct import path based on your folder structure
import { useTeam } from '../../../../../../contexts/TeamContext';
import BreadcrumbItem from './BreadcrumbItem';
import BreadcrumbSeparator from './BreadcrumbSeparator';
import { generateBreadcrumbItems, useBreadcrumbNavigation } from './utils/breadcrumbUtils';
import { SEPARATOR_TYPES, SIZE_VARIANTS, DEFAULT_CONFIG } from './constants';

/**
 * Enhanced TeamSpace Breadcrumb Component
 * Features: Smart navigation, responsive design, accessibility, analytics
 */
const TeamSpaceBreadcrumb = memo(({
  customItems = null,
  showTeamLogo = DEFAULT_CONFIG.showTeamLogo,
  showIcons = DEFAULT_CONFIG.showIcons,
  maxItems = DEFAULT_CONFIG.maxItems,
  onNavigate = null,
  className = "",
  separator = DEFAULT_CONFIG.separator,
  size = DEFAULT_CONFIG.size,
  trackNavigation = DEFAULT_CONFIG.trackNavigation,
  collapsible = DEFAULT_CONFIG.collapsible,
  hideOnSingleItem = DEFAULT_CONFIG.hideOnSingleItem,
  enableKeyboardNavigation = true,
  ariaLabel = "Breadcrumb navigation"
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ ENHANCED: Better error handling for team context
  const teamContext = useTeam();
  const currentTeam = teamContext?.currentTeam || null;
  
  const { handleNavigation } = useBreadcrumbNavigation({
    onNavigate,
    trackNavigation,
    team: currentTeam
  });

  /**
   * Generate breadcrumb items with enhanced logic
   */
  const breadcrumbItems = useMemo(() => {
    if (customItems) return customItems;

    return generateBreadcrumbItems({
      pathname: location.pathname,
      team: currentTeam,
      showIcons,
      maxItems,
      collapsible
    });
  }, [location.pathname, customItems, currentTeam, showIcons, maxItems, collapsible]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event, item, index) => {
    if (!enableKeyboardNavigation) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (item.clickable && !item.ellipsis) {
          handleNavigation(item, index);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        // Focus previous clickable item
        const prevIndex = breadcrumbItems.slice(0, index).reverse().findIndex(item => item.clickable);
        if (prevIndex !== -1) {
          const actualIndex = index - prevIndex - 1;
          const prevElement = document.querySelector(`[data-breadcrumb-index="${actualIndex}"]`);
          prevElement?.focus();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        // Focus next clickable item
        const nextIndex = breadcrumbItems.slice(index + 1).findIndex(item => item.clickable);
        if (nextIndex !== -1) {
          const actualIndex = index + nextIndex + 1;
          const nextElement = document.querySelector(`[data-breadcrumb-index="${actualIndex}"]`);
          nextElement?.focus();
        }
        break;
      default:
        break;
    }
  }, [enableKeyboardNavigation, breadcrumbItems, handleNavigation]);

  /**
   * Don't render if conditions are met
   */
  if (hideOnSingleItem && breadcrumbItems.length <= 1) {
    return null;
  }

  /**
   * Container classes with enhanced responsive support
   */
  const containerClasses = [
    'team-space-breadcrumb',
    `breadcrumb-${size}`,
    `breadcrumb-${separator}`,
    enableKeyboardNavigation ? 'keyboard-enabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <nav 
      className={containerClasses} 
      aria-label={ariaLabel}
      role="navigation"
    >
      <ol className="breadcrumb-list" role="list">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.id || `breadcrumb-${index}`}>
            <BreadcrumbItem
              item={item}
              index={index}
              isLast={index === breadcrumbItems.length - 1}
              showTeamLogo={showTeamLogo}
              showIcons={showIcons}
              size={size}
              onNavigate={handleNavigation}
              onKeyDown={handleKeyDown}
              enableKeyboardNavigation={enableKeyboardNavigation}
            />
            {index < breadcrumbItems.length - 1 && (
              <BreadcrumbSeparator 
                type={separator} 
                size={size} 
                index={index}
              />
            )}
          </React.Fragment>
        ))}
      </ol>

      {/* Enhanced Breadcrumb Styles */}
      <style jsx>{`
        .team-space-breadcrumb {
          margin-bottom: 20px;
          position: relative;
        }

        .breadcrumb-list {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 4px;
          min-height: 32px;
        }

        /* Enhanced keyboard navigation */
        .keyboard-enabled .breadcrumb-list {
          outline: none;
        }

        .keyboard-enabled .breadcrumb-item:focus-within {
          outline: 2px solid var(--primary-color, #4a6cf7);
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Size Variants */
        .breadcrumb-small {
          margin-bottom: 16px;
        }

        .breadcrumb-small .breadcrumb-list {
          gap: 2px;
          min-height: 28px;
        }

        .breadcrumb-large {
          margin-bottom: 24px;
        }

        .breadcrumb-large .breadcrumb-list {
          gap: 6px;
          min-height: 36px;
        }

        /* Enhanced Responsive Design */
        @media (max-width: 768px) {
          .breadcrumb-list {
            gap: 2px;
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding-bottom: 2px; /* Prevent scrollbar cutoff */
          }

          .breadcrumb-list::-webkit-scrollbar {
            display: none;
          }

          /* Smart hiding that matches navigation pattern */
          .breadcrumb-item:not(:first-child):not(:last-child):not(.ellipsis) {
            display: ${breadcrumbItems.length > 3 ? 'none' : 'flex'};
          }

          .breadcrumb-item.ellipsis {
            display: flex;
          }

          /* Mobile scroll indicator using TeamSpace colors */
          .team-space-breadcrumb::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 20px;
            background: linear-gradient(to right, transparent, var(--bg-dark, #1a202c));
            pointer-events: none;
            z-index: 1;
          }
        }

        @media (max-width: 480px) {
          .team-space-breadcrumb {
            margin-bottom: 12px;
          }

          .breadcrumb-list {
            justify-content: flex-start;
            width: 100%;
            padding-right: 20px; /* Account for scroll indicator */
          }
        }

        /* Enhanced accessibility */
        @media (prefers-reduced-motion: reduce) {
          .breadcrumb-list {
            scroll-behavior: auto;
          }
        }

        @media (prefers-contrast: high) {
          .breadcrumb-list {
            border: 1px solid var(--border-color, #2d3748);
            border-radius: 4px;
            padding: 4px;
            background-color: var(--secondary-color, #232b3a);
          }

          .keyboard-enabled .breadcrumb-item:focus-within {
            outline-width: 3px;
          }
        }

        /* Enhanced print styles */
        @media print {
          .team-space-breadcrumb {
            border-bottom: 1px solid #000;
            padding-bottom: 8px;
            margin-bottom: 16px;
          }

          .team-space-breadcrumb::after {
            display: none;
          }
        }

        /* Dark mode enhancements */
        @media (prefers-color-scheme: light) {
          .team-space-breadcrumb::after {
            background: linear-gradient(to right, transparent, #ffffff);
          }
        }

        /* RTL support */
        [dir="rtl"] .breadcrumb-list {
          direction: rtl;
        }

        [dir="rtl"] .team-space-breadcrumb::after {
          right: auto;
          left: 0;
          background: linear-gradient(to left, transparent, var(--bg-dark, #1a202c));
        }
      `}</style>
    </nav>
  );
});

// Enhanced display name for debugging
TeamSpaceBreadcrumb.displayName = 'TeamSpaceBreadcrumb';

// Enhanced PropTypes with better validation
TeamSpaceBreadcrumb.propTypes = {
  customItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    path: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    clickable: PropTypes.bool,
    active: PropTypes.bool,
    team: PropTypes.object,
    ellipsis: PropTypes.bool
  })),
  showTeamLogo: PropTypes.bool,
  showIcons: PropTypes.bool,
  maxItems: PropTypes.number,
  onNavigate: PropTypes.func,
  className: PropTypes.string,
  separator: PropTypes.oneOf(Object.keys(SEPARATOR_TYPES)),
  size: PropTypes.oneOf(Object.keys(SIZE_VARIANTS)),
  trackNavigation: PropTypes.bool,
  collapsible: PropTypes.bool,
  hideOnSingleItem: PropTypes.bool,
  enableKeyboardNavigation: PropTypes.bool,
  ariaLabel: PropTypes.string
};

export default TeamSpaceBreadcrumb;