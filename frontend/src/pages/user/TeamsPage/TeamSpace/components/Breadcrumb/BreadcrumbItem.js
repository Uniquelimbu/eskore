import React, { memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced Breadcrumb Item Component
 * Features: Accessibility, keyboard navigation, performance optimization
 */
const BreadcrumbItem = memo(({
  item,
  index,
  isLast,
  showTeamLogo = true,
  showIcons = true,
  size = "default",
  onNavigate,
  onKeyDown,
  enableKeyboardNavigation = true
}) => {
  const itemRef = useRef(null);

  /**
   * Handle item click with enhanced logic
   */
  const handleClick = () => {
    if (!item.clickable || item.ellipsis) return;
    onNavigate(item, index);
  };

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (event) => {
    if (onKeyDown && enableKeyboardNavigation) {
      onKeyDown(event, item, index);
    }
  };

  /**
   * Enhanced team logo rendering with error handling
   */
  const renderTeamLogo = () => {
    if (!showTeamLogo || !item.team?.logoUrl) return null;

    return (
      <img 
        src={item.team.logoUrl} 
        alt=""
        className="breadcrumb-team-logo"
        loading="lazy"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  };

  /**
   * Enhanced icon rendering with fallback
   */
  const renderIcon = () => {
    if (!showIcons || !item.icon) return null;

    return (
      <span className="breadcrumb-icon" aria-hidden="true">
        {typeof item.icon === 'string' ? (
          <span role="img" aria-label="">{item.icon}</span>
        ) : (
          item.icon
        )}
      </span>
    );
  };

  /**
   * Render item content with accessibility
   */
  const renderContent = () => (
    <>
      {renderTeamLogo()}
      {renderIcon()}
      <span className="breadcrumb-label">{item.label}</span>
    </>
  );

  /**
   * Enhanced container classes
   */
  const itemClasses = [
    'breadcrumb-item',
    item.active ? 'active' : '',
    item.clickable && !item.ellipsis ? 'clickable' : '',
    item.ellipsis ? 'ellipsis' : '',
    `item-${size}`,
    isLast ? 'last-item' : ''
  ].filter(Boolean).join(' ');

  /**
   * Handle ellipsis items with tooltip support
   */
  if (item.ellipsis) {
    return (
      <li className={itemClasses} role="listitem">
        <span 
          className="breadcrumb-ellipsis" 
          aria-label="More items"
          title="More navigation items"
        >
          {item.label}
        </span>
      </li>
    );
  }

  /**
   * Enhanced clickable/non-clickable item rendering
   */
  return (
    <li className={itemClasses} role="listitem">
      {item.clickable && !item.ellipsis ? (
        <button
          ref={itemRef}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="breadcrumb-link"
          aria-current={item.active ? 'page' : undefined}
          title={`Navigate to ${item.label}`}
          type="button"
          data-breadcrumb-index={index}
          tabIndex={enableKeyboardNavigation ? 0 : -1}
        >
          {renderContent()}
        </button>
      ) : (
        <span 
          className="breadcrumb-text"
          aria-current={item.active ? 'page' : undefined}
          data-breadcrumb-index={index}
        >
          {renderContent()}
        </span>
      )}

      {/* Enhanced Item Styles */}
      <style jsx>{`
        .breadcrumb-item {
          display: flex;
          align-items: center;
          position: relative;
        }

        .breadcrumb-link,
        .breadcrumb-text {
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          transition: all 0.2s ease;
          border-radius: 4px;
          padding: 4px 8px;
          font-weight: 500;
          border: none;
          background: none;
          cursor: ${item.clickable ? 'pointer' : 'default'};
          font-family: inherit;
          font-size: inherit;
          line-height: 1.4;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }

        /* Enhanced interactive states */
        .breadcrumb-link {
          color: var(--text-muted, #a0aec0);
          position: relative;
        }

        .breadcrumb-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(74, 108, 247, 0.1);
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .breadcrumb-link:hover::before {
          opacity: 1;
        }

        .breadcrumb-link:hover {
          color: var(--primary-color, #4a6cf7);
          transform: translateY(-1px);
        }

        .breadcrumb-link:focus {
          outline: 2px solid var(--primary-color, #4a6cf7);
          outline-offset: 2px;
          z-index: 1;
        }

        .breadcrumb-link:active {
          transform: translateY(0);
        }

        .breadcrumb-text {
          color: var(--text-light, #e2e8f0);
        }

        /* Enhanced active states */
        .breadcrumb-item.active .breadcrumb-text,
        .breadcrumb-item.active .breadcrumb-link {
          color: var(--primary-color, #4a6cf7);
          font-weight: 600;
          position: relative;
        }

        .breadcrumb-item.active .breadcrumb-text::after,
        .breadcrumb-item.active .breadcrumb-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 8px;
          right: 8px;
          height: 2px;
          background: var(--primary-color, #4a6cf7);
          border-radius: 1px;
        }

        /* Component styling */
        .breadcrumb-icon {
          font-size: 0.9em;
          opacity: 0.8;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .breadcrumb-label {
          white-space: nowrap;
          line-height: 1.2;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .breadcrumb-team-logo {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-color, #2d3748);
          flex-shrink: 0;
        }

        .breadcrumb-ellipsis {
          color: var(--text-muted, #a0aec0);
          padding: 4px 8px;
          font-weight: 600;
          cursor: help;
          position: relative;
        }

        /* Enhanced size variants */
        .item-small .breadcrumb-link,
        .item-small .breadcrumb-text {
          padding: 2px 6px;
          font-size: 0.85rem;
          gap: 4px;
        }

        .item-small .breadcrumb-team-logo {
          width: 14px;
          height: 14px;
        }

        .item-small .breadcrumb-icon {
          font-size: 0.8em;
        }

        .item-small .breadcrumb-label {
          max-width: 150px;
        }

        .item-large .breadcrumb-link,
        .item-large .breadcrumb-text {
          padding: 6px 12px;
          font-size: 1.1rem;
          gap: 8px;
        }

        .item-large .breadcrumb-team-logo {
          width: 20px;
          height: 20px;
        }

        .item-large .breadcrumb-icon {
          font-size: 1.1em;
        }

        .item-large .breadcrumb-label {
          max-width: 250px;
        }

        /* Enhanced responsive design */
        @media (max-width: 768px) {
          .breadcrumb-link,
          .breadcrumb-text {
            padding: 2px 4px;
            font-size: 0.9rem;
            gap: 4px;
          }

          .breadcrumb-team-logo {
            width: 14px;
            height: 14px;
          }

          .breadcrumb-icon {
            font-size: 0.8em;
          }

          .breadcrumb-label {
            max-width: 120px;
          }
        }

        @media (max-width: 480px) {
          .breadcrumb-label {
            max-width: 80px;
          }

          .breadcrumb-icon {
            display: ${showIcons ? 'none' : 'flex'};
          }

          .breadcrumb-team-logo {
            display: ${showTeamLogo ? 'none' : 'block'};
          }
        }

        /* Enhanced accessibility */
        @media (prefers-reduced-motion: reduce) {
          .breadcrumb-link,
          .breadcrumb-link::before {
            transition: none;
          }

          .breadcrumb-link:hover {
            transform: none;
          }
        }

        @media (prefers-contrast: high) {
          .breadcrumb-link {
            border: 1px solid transparent;
          }

          .breadcrumb-link:hover,
          .breadcrumb-link:focus {
            border-color: currentColor;
            background-color: transparent;
          }

          .breadcrumb-link::before {
            display: none;
          }
        }

        /* Enhanced print styles */
        @media print {
          .breadcrumb-link,
          .breadcrumb-text {
            color: #000 !important;
            background: none !important;
          }

          .breadcrumb-team-logo,
          .breadcrumb-icon {
            display: none;
          }

          .breadcrumb-link::before,
          .breadcrumb-link::after {
            display: none;
          }
        }

        /* Last item styling */
        .last-item .breadcrumb-text {
          font-weight: 600;
        }

        /* Loading state for team logos */
        .breadcrumb-team-logo[src=""] {
          display: none;
        }
      `}</style>
    </li>
  );
});

// Enhanced display name
BreadcrumbItem.displayName = 'BreadcrumbItem';

// Enhanced PropTypes
BreadcrumbItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    path: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    clickable: PropTypes.bool,
    active: PropTypes.bool,
    team: PropTypes.object,
    ellipsis: PropTypes.bool
  }).isRequired,
  index: PropTypes.number.isRequired,
  isLast: PropTypes.bool.isRequired,
  showTeamLogo: PropTypes.bool,
  showIcons: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  onNavigate: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  enableKeyboardNavigation: PropTypes.bool
};

export default BreadcrumbItem;