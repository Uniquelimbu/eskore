import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

// Separate logic function from rendering
const getButtonClassNames = (props) => {
  const {
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    isLoading = false
  } = props;
  
  return {
    base: styles.button,
    variant: styles[`variant_${variant}`],
    size: styles[`size_${size}`],
    fullWidth: fullWidth ? styles.fullWidth : '',
    loading: isLoading ? styles.loading : '',
  };
};

// Separate content logic from component rendering
const getButtonContent = (props) => {
  const {
    children,
    isLoading,
    startIcon,
    endIcon
  } = props;
  
  return (
    <>
      {isLoading && <span className={styles.loader}></span>}
      {startIcon && <span className={styles.iconStart}>{startIcon}</span>}
      <span className={styles.text}>{children}</span>
      {endIcon && <span className={styles.iconEnd}>{endIcon}</span>}
    </>
  );
};

// Main component uses the helper functions
const Button = (props) => {
  const {
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    disabled = false,
    isLoading = false,
    href,
    to,
    className = '',
    type = 'button',
    onClick,
    ...otherProps
  } = props;
  
  // Get classes from helper function
  const classes = getButtonClassNames(props);
  // Combine all classes
  const buttonClassName = [
    classes.base, 
    classes.variant, 
    classes.size, 
    classes.fullWidth, 
    classes.loading, 
    className
  ].filter(Boolean).join(' ');
  
  // Get content from helper function
  const content = getButtonContent(props);
  
  // External links
  if (href) {
    return (
      <a
        href={href}
        className={buttonClassName}
        target="_blank"
        rel="noopener noreferrer"
        {...otherProps}
      >
        {content}
      </a>
    );
  }
  
  // Router links
  if (to) {
    return (
      <Link
        to={to}
        className={buttonClassName}
        {...otherProps}
      >
        {content}
      </Link>
    );
  }
  
  // Standard button
  return (
    <button
      type={type}
      className={buttonClassName}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...otherProps}
    >
      {content}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  href: PropTypes.string,
  to: PropTypes.string,
  className: PropTypes.string,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  type: PropTypes.string,
  onClick: PropTypes.func
};

export default Button;
