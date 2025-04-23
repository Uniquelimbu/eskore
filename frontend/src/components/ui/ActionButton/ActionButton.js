import React from 'react';
import PropTypes from 'prop-types';
import styles from './ActionButton.module.css';

/**
 * Action Button with limited, well-defined customization points
 * By strictly controlling customization options, we maintain consistency
 */
const ActionButton = ({
  // Limited set of variants to maintain design system integrity
  variant = 'primary',
  // Limited size options
  size = 'medium',
  // Boolean props for common use cases rather than arbitrary customization
  isFullWidth = false,
  isLoading = false,
  isDisabled = false,
  // Content control
  children,
  icon,
  // Event handlers
  onClick,
  // Controlled extension points - no arbitrary props spreading
  className,
  testId,
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    isFullWidth ? styles.fullWidth : '',
    className || ''
  ].filter(Boolean).join(' ');
  
  return (
    <button
      type="button"
      className={buttonClasses}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      data-testid={testId}
    >
      {isLoading && <span className={styles.loader} />}
      {icon && !isLoading && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{children}</span>
    </button>
  );
};

ActionButton.propTypes = {
  // Strictly limited variants for consistency
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  // Boolean flags instead of arbitrary styling props
  isFullWidth: PropTypes.bool,
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  // Content
  children: PropTypes.node.isRequired,
  icon: PropTypes.node,
  // Events
  onClick: PropTypes.func,
  // Limited extension points
  className: PropTypes.string,
  testId: PropTypes.string
};

export default ActionButton;
