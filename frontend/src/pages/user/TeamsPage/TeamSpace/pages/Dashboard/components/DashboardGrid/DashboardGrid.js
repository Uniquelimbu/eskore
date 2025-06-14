import React, { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../../../../../../../../contexts/TeamContext';
import NavigationCard from '../NavigationCard/NavigationCard';
import './DashboardGrid.css';

/**
 * Default navigation cards configuration
 */
export const defaultNavigationCards = [
  {
    id: 'squad',
    title: 'Squad',
    subtitle: 'Manage your team members',
    path: 'squad',
    icon: '👥',
    size: 'large',
    gridArea: 'squad',
    priority: 1,
    roles: ['member', 'player', 'coach', 'manager']
  },
  {
    id: 'formation',
    title: 'Formation',
    subtitle: 'Set up your team\'s formation',
    path: 'formation',
    icon: '⚽',
    size: 'medium',
    gridArea: 'formation',
    priority: 2,
    roles: ['player', 'coach', 'manager']
  },
  {
    id: 'calendar',
    title: 'Calendar',
    subtitle: '',
    path: 'calendar',
    icon: '📅',
    size: 'small',
    gridArea: 'calendar',
    priority: 3,
    roles: ['member', 'player', 'coach', 'manager']
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: '',
    path: 'settings',
    icon: '⚙️',
    size: 'small',
    gridArea: 'settings',
    priority: 4,
    roles: ['manager']
  }
];

/**
 * Hook for dashboard grid state management
 */
export const useDashboardGrid = () => {
  const { currentTeam, isManager } = useTeam();
  
  const availableCards = useMemo(() => {
    const userRole = isManager ? 'manager' : 'member';
    
    return defaultNavigationCards
      .filter(card => card.roles.includes(userRole))
      .sort((a, b) => a.priority - b.priority);
  }, [isManager]);

  return {
    cards: availableCards,
    team: currentTeam,
    isManager
  };
};

/**
 * DashboardGrid Component
 */
const DashboardGrid = memo(({
  onNavigate = null,
  className = '',
  customCards = null,
  trackAnalytics = true
}) => {
  const navigate = useNavigate();
  const { currentTeam, isManager } = useTeam();

  /**
   * Filter cards based on user permissions
   */
  const availableCards = useMemo(() => {
    const cards = customCards || defaultNavigationCards;
    const userRole = isManager ? 'manager' : 'member';
    
    return cards
      .filter(card => card.roles.includes(userRole))
      .sort((a, b) => a.priority - b.priority);
  }, [customCards, isManager]);

  /**
   * Handle card navigation
   */
  const handleCardClick = useCallback((card) => {
    if (!currentTeam?.id) {
      console.warn('DashboardGrid: No current team available for navigation');
      return;
    }

    // Analytics tracking
    if (trackAnalytics && window.gtag) {
      window.gtag('event', 'dashboard_navigation', {
        card_id: card.id,
        card_title: card.title,
        team_id: currentTeam.id,
        user_role: isManager ? 'manager' : 'member'
      });
    }

    // Custom navigation callback
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate(card.path, card);
      return;
    }

    // Default navigation
    const targetPath = `/teams/${currentTeam.id}/space/${card.path}`;
    navigate(targetPath);
  }, [currentTeam?.id, isManager, onNavigate, navigate, trackAnalytics]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event, card) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick(card);
    }
  }, [handleCardClick]);

  /**
   * CSS classes
   */
  const gridClasses = [
    'dashboard-grid',
    `dashboard-grid--${availableCards.length}-cards`,
    className
  ].filter(Boolean).join(' ');

  // Don't render if no team or no cards
  if (!currentTeam || availableCards.length === 0) {
    return (
      <div className="dashboard-grid-empty">
        <div className="dashboard-grid-empty-content">
          <h3>No navigation options available</h3>
          <p>Please contact your team manager for access.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={gridClasses}
      role="navigation"
      aria-label="Team dashboard navigation"
    >
      {availableCards.map((card) => (
        <NavigationCard
          key={card.id}
          id={card.id}
          title={card.title}
          subtitle={card.subtitle}
          icon={card.icon}
          size={card.size}
          gridArea={card.gridArea}
          onClick={() => handleCardClick(card)}
          onKeyDown={(event) => handleKeyDown(event, card)}
          className={`dashboard-grid-card dashboard-grid-card--${card.size}`}
          tabIndex={0}
          role="button"
          aria-label={`Navigate to ${card.title}${card.subtitle ? `: ${card.subtitle}` : ''}`}
        />
      ))}
    </div>
  );
});

DashboardGrid.displayName = 'DashboardGrid';

DashboardGrid.propTypes = {
  onNavigate: PropTypes.func,
  className: PropTypes.string,
  customCards: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    path: PropTypes.string.isRequired,
    icon: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large']).isRequired,
    gridArea: PropTypes.string,
    priority: PropTypes.number,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired
  })),
  trackAnalytics: PropTypes.bool
};

export default DashboardGrid;