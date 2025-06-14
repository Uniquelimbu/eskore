import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import './NavigationCard.css';

/**
 * NavigationCard Component
 * 
 * Industry-standard navigation card component for dashboard grid.
 * Features minimalistic design with hover effects, accessibility, and analytics tracking.
 */
const NavigationCard = memo(({
  id,
  title,
  subtitle = '',
  icon = '📄',
  size = 'medium',
  gridArea = '',
  onClick = null,
  onKeyDown = null,
  className = '',
  tabIndex = 0,
  role = 'button',
  ariaLabel = '',
  disabled = false,
  loading = false,
  variant = 'default',
  trackHover = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  /**
   * Handle click with ripple effect
   */
  const handleClick = useCallback((event) => {
    if (disabled || loading) return;

    // Create ripple effect
    setRippleKey(prev => prev + 1);

    // Analytics tracking for hover behavior
    if (trackHover && window.gtag) {
      window.gtag('event', 'navigation_card_click', {
        card_id: id,
        card_title: title,
        variant,
        size
      });
    }

    // Execute callback
    if (onClick && typeof onClick === 'function') {
      onClick(event);
    }
  }, [disabled, loading, trackHover, id, title, variant, size, onClick]);

  /**
   * Handle keyboard interaction
   */
  const handleKeyDown = useCallback((event) => {
    if (disabled || loading) return;

    if (onKeyDown && typeof onKeyDown === 'function') {
      onKeyDown(event);
    }

    // Handle space/enter keys
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(event);
    }
  }, [disabled, loading, onKeyDown, handleClick]);

  /**
   * Handle mouse events for hover state
   */
  const handleMouseEnter = useCallback(() => {
    if (!disabled && !loading) {
      setIsHovered(true);
    }
  }, [disabled, loading]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  /**
   * Handle focus events
   */
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  /**
   * Build CSS classes
   */
  const cardClasses = [
    'navigation-card',
    `navigation-card--${size}`,
    `navigation-card--${variant}`,
    isHovered ? 'navigation-card--hovered' : '',
    isFocused ? 'navigation-card--focused' : '',
    disabled ? 'navigation-card--disabled' : '',
    loading ? 'navigation-card--loading' : '',
    className
  ].filter(Boolean).join(' ');

  /**
   * Build inline styles for grid positioning
   */
  const cardStyles = gridArea ? { gridArea } : {};

  /**
   * Render card content
   */
  const renderContent = () => {
    if (loading) {
      return (
        <div className="navigation-card-loading">
          <div className="navigation-card-spinner"></div>
          <span className="navigation-card-loading-text">Loading...</span>
        </div>
      );
    }

    return (
      <div className="navigation-card-content">
        {icon && (
          <div className="navigation-card-icon">
            <span className="navigation-card-emoji">{icon}</span>
          </div>
        )}
        
        <h3 className="navigation-card-title">{title}</h3>
        
        {subtitle && (
          <p className="navigation-card-subtitle">{subtitle}</p>
        )}
      </div>
    );
  };

  return (
    <div
      className={cardClasses}
      style={cardStyles}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={disabled ? -1 : tabIndex}
      role={role}
      aria-label={ariaLabel || `${title}${subtitle ? `: ${subtitle}` : ''}`}
      aria-disabled={disabled}
      aria-busy={loading}
    >
      {renderContent()}
      
      {/* Ripple effect */}
      {rippleKey > 0 && !disabled && !loading && (
        <div key={rippleKey} className="navigation-card-ripple" />
      )}
      
      {/* Focus indicator */}
      <div className="navigation-card-focus-indicator" />
    </div>
  );
});

NavigationCard.displayName = 'NavigationCard';

NavigationCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  gridArea: PropTypes.string,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  className: PropTypes.string,
  tabIndex: PropTypes.number,
  role: PropTypes.string,
  ariaLabel: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'danger']),
  trackHover: PropTypes.bool
};

export default NavigationCard;

// Named exports for variants
export const PrimaryNavigationCard = (props) => (
  <NavigationCard {...props} variant="primary" />
);

export const SecondaryNavigationCard = (props) => (
  <NavigationCard {...props} variant="secondary" />
);

export const LoadingNavigationCard = (props) => (
  <NavigationCard {...props} loading={true} />
);

export const DisabledNavigationCard = (props) => (
  <NavigationCard {...props} disabled={true} />
);

// Hook for navigation card state
export const useNavigationCard = (cardId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNavigation = useCallback(async (navigationFn) => {
    setLoading(true);
    setError(null);
    
    try {
      await navigationFn();
    } catch (err) {
      setError(err.message || 'Navigation failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    handleNavigation,
    clearError: () => setError(null)
  };
};