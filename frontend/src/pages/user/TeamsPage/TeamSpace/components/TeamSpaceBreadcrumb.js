import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Industry-standard Breadcrumb Navigation for TeamSpace
 * Features: Auto-generation, custom items, accessibility, analytics
 */
const TeamSpaceBreadcrumb = memo(({
  customItems = null,
  showTeamLogo = true,
  showIcons = true,
  maxItems = 5,
  onNavigate = null,
  className = "",
  separator = "chevron", // chevron, slash, arrow, dot
  size = "default", // small, default, large
  team = null,
  trackNavigation = true
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Generate breadcrumb items from current path
   */
  const breadcrumbItems = useMemo(() => {
    if (customItems) return customItems;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [];

    // Add home/teams root
    items.push({
      label: 'Teams',
      path: '/teams',
      icon: showIcons ? '🏠' : null,
      clickable: true
    });

    // Find team ID and name
    const teamIndex = pathSegments.findIndex(segment => segment === 'teams');
    const teamId = teamIndex >= 0 ? pathSegments[teamIndex + 1] : null;
    const teamName = team?.name || `Team ${teamId}`;

    if (teamId) {
      // Add team space root
      items.push({
        label: teamName,
        path: `/teams/${teamId}/space`,
        icon: showIcons ? '👥' : null,
        clickable: true,
        team: team
      });

      // Add current page if not root
      const spaceIndex = pathSegments.findIndex(segment => segment === 'space');
      const currentPage = spaceIndex >= 0 ? pathSegments[spaceIndex + 1] : null;

      if (currentPage) {
        const pageLabels = {
          squad: { label: 'Squad', icon: '👥' },
          formation: { label: 'Formation', icon: '⚽' },
          calendar: { label: 'Calendar', icon: '📅' },
          settings: { label: 'Settings', icon: '⚙️' }
        };

        const pageConfig = pageLabels[currentPage] || { 
          label: currentPage.charAt(0).toUpperCase() + currentPage.slice(1), 
          icon: '📄' 
        };

        items.push({
          label: pageConfig.label,
          path: location.pathname,
          icon: showIcons ? pageConfig.icon : null,
          clickable: false,
          active: true
        });
      }
    }

    // Limit items if too many
    if (items.length > maxItems) {
      const start = items.slice(0, 1);
      const end = items.slice(-2);
      const middle = [{ label: '...', ellipsis: true }];
      return [...start, ...middle, ...end];
    }

    return items;
  }, [location.pathname, customItems, showIcons, maxItems, team]);

  /**
   * Handle breadcrumb item click
   */
  const handleItemClick = (item, index) => {
    if (!item.clickable || item.ellipsis) return;

    // Track navigation
    if (trackNavigation && window.gtag) {
      window.gtag('event', 'breadcrumb_click', {
        item_label: item.label,
        item_index: index,
        team_id: team?.id
      });
    }

    // Custom navigation handler
    if (onNavigate) {
      const shouldNavigate = onNavigate(item, index);
      if (shouldNavigate === false) return;
    }

    // Default navigation
    if (item.path) {
      navigate(item.path);
    }
  };

  /**
   * Render breadcrumb separator
   */
  const renderSeparator = (index) => {
    const separators = {
      chevron: '›',
      slash: '/',
      arrow: '→',
      dot: '·'
    };

    return (
      <span 
        className="breadcrumb-separator" 
        aria-hidden="true"
        key={`separator-${index}`}
      >
        {separators[separator] || separators.chevron}
      </span>
    );
  };

  /**
   * Render team logo if available
   */
  const renderTeamLogo = (item) => {
    if (!showTeamLogo || !item.team?.logoUrl) return null;

    return (
      <img 
        src={item.team.logoUrl} 
        alt={`${item.team.name} logo`}
        className="breadcrumb-team-logo"
      />
    );
  };

  /**
   * Render breadcrumb item
   */
  const renderItem = (item, index) => {
    const isLast = index === breadcrumbItems.length - 1;
    const itemClasses = [
      'breadcrumb-item',
      item.active ? 'active' : '',
      item.clickable && !item.ellipsis ? 'clickable' : '',
      item.ellipsis ? 'ellipsis' : ''
    ].filter(Boolean).join(' ');

    if (item.ellipsis) {
      return (
        <li key={`ellipsis-${index}`} className={itemClasses}>
          <span className="breadcrumb-ellipsis">{item.label}</span>
        </li>
      );
    }

    const ItemContent = () => (
      <>
        {renderTeamLogo(item)}
        {item.icon && (
          <span className="breadcrumb-icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span className="breadcrumb-label">{item.label}</span>
      </>
    );

    return (
      <li key={item.path || index} className={itemClasses}>
        {item.clickable && !item.ellipsis ? (
          <button
            onClick={() => handleItemClick(item, index)}
            className="breadcrumb-link"
            aria-current={item.active ? 'page' : undefined}
            title={`Go to ${item.label}`}
          >
            <ItemContent />
          </button>
        ) : (
          <span 
            className="breadcrumb-text"
            aria-current={item.active ? 'page' : undefined}
          >
            <ItemContent />
          </span>
        )}
      </li>
    );
  };

  // Container classes
  const containerClasses = [
    'team-space-breadcrumb',
    `breadcrumb-${size}`,
    `breadcrumb-${separator}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <nav 
      className={containerClasses} 
      aria-label="Breadcrumb navigation"
      role="navigation"
    >
      <ol className="breadcrumb-list">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={`fragment-${index}`}>
            {renderItem(item, index)}
            {index < breadcrumbItems.length - 1 && renderSeparator(index)}
          </React.Fragment>
        ))}
      </ol>

      {/* Breadcrumb Styles */}
      <style jsx>{`
        .team-space-breadcrumb {
          margin-bottom: 20px;
        }

        .breadcrumb-list {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 4px;
        }

        /* Breadcrumb Items */
        .breadcrumb-item {
          display: flex;
          align-items: center;
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
        }

        .breadcrumb-link {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted, #a0aec0);
        }

        .breadcrumb-link:hover {
          color: var(--primary-color, #4a6cf7);
          background-color: rgba(74, 108, 247, 0.1);
        }

        .breadcrumb-text {
          color: var(--text-light, #e2e8f0);
        }

        .breadcrumb-item.active .breadcrumb-text {
          color: var(--primary-color, #4a6cf7);
          font-weight: 600;
        }

        /* Breadcrumb Components */
        .breadcrumb-icon {
          font-size: 0.9em;
          opacity: 0.8;
        }

        .breadcrumb-label {
          white-space: nowrap;
        }

        .breadcrumb-team-logo {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-color, #2d3748);
        }

        .breadcrumb-ellipsis {
          color: var(--text-muted, #a0aec0);
          padding: 4px 8px;
          font-weight: 600;
        }

        /* Separators */
        .breadcrumb-separator {
          color: var(--text-muted, #a0aec0);
          margin: 0 2px;
          font-size: 0.9em;
          opacity: 0.6;
        }

        /* Size Variants */
        .breadcrumb-small .breadcrumb-link,
        .breadcrumb-small .breadcrumb-text {
          padding: 2px 6px;
          font-size: 0.85rem;
          gap: 4px;
        }

        .breadcrumb-small .breadcrumb-team-logo {
          width: 14px;
          height: 14px;
        }

        .breadcrumb-small .breadcrumb-icon {
          font-size: 0.8em;
        }

        .breadcrumb-large .breadcrumb-link,
        .breadcrumb-large .breadcrumb-text {
          padding: 6px 12px;
          font-size: 1.1rem;
          gap: 8px;
        }

        .breadcrumb-large .breadcrumb-team-logo {
          width: 20px;
          height: 20px;
        }

        .breadcrumb-large .breadcrumb-icon {
          font-size: 1.1em;
        }

        /* Separator Styles */
        .breadcrumb-slash .breadcrumb-separator {
          font-weight: 300;
        }

        .breadcrumb-arrow .breadcrumb-separator {
          font-weight: 400;
        }

        .breadcrumb-dot .breadcrumb-separator {
          font-size: 1.2em;
          font-weight: bold;
        }

        /* Focus States */
        .breadcrumb-link:focus {
          outline: 2px solid var(--primary-color, #4a6cf7);
          outline-offset: 2px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .breadcrumb-list {
            gap: 2px;
          }

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

          .breadcrumb-separator {
            margin: 0 1px;
            font-size: 0.8em;
          }

          /* Hide middle items on very small screens */
          .breadcrumb-item:not(:first-child):not(:last-child):not(.ellipsis) {
            display: none;
          }

          .breadcrumb-item.ellipsis {
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .breadcrumb-label {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .breadcrumb-icon {
            display: none;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          .breadcrumb-link {
            border: 1px solid transparent;
          }

          .breadcrumb-link:hover,
          .breadcrumb-link:focus {
            border-color: currentColor;
            background-color: transparent;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .breadcrumb-link {
            transition: none;
          }
        }
      `}</style>
    </nav>
  );
});

// Display name for debugging
TeamSpaceBreadcrumb.displayName = 'TeamSpaceBreadcrumb';

// PropTypes
TeamSpaceBreadcrumb.propTypes = {
  customItems: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string,
    icon: PropTypes.string,
    clickable: PropTypes.bool,
    active: PropTypes.bool,
    team: PropTypes.object
  })),
  showTeamLogo: PropTypes.bool,
  showIcons: PropTypes.bool,
  maxItems: PropTypes.number,
  onNavigate: PropTypes.func,
  className: PropTypes.string,
  separator: PropTypes.oneOf(['chevron', 'slash', 'arrow', 'dot']),
  size: PropTypes.oneOf(['small', 'default', 'large']),
  team: PropTypes.object,
  trackNavigation: PropTypes.bool
};

export default TeamSpaceBreadcrumb;