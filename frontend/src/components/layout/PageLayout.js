import React from 'react';
import PropTypes from 'prop-types';
import './PageLayout.css';

/**
 * Standard page layout component with consistent structure
 */
const PageLayout = ({ 
  children, 
  maxWidth, 
  fullHeight = false,
  className = '', 
  withPadding = true 
}) => {
  return (
    <div 
      className={`page-layout ${fullHeight ? 'page-layout--full-height' : ''} ${className}`}
    >
      <div 
        className={`page-layout__container ${withPadding ? 'page-layout__container--padded' : ''}`}
        style={maxWidth ? { maxWidth } : {}}
      >
        {children}
      </div>
    </div>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
  fullHeight: PropTypes.bool,
  className: PropTypes.string,
  withPadding: PropTypes.bool
};

export default PageLayout;
