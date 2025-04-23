import React from 'react';
import PropTypes from 'prop-types';
import styles from './FeatureCard.module.css';

// Header component is composed inside FeatureCard
const FeatureCardHeader = ({ icon, title }) => (
  <div className={styles.header}>
    {icon && <div className={styles.icon}>{icon}</div>}
    {title && <h3 className={styles.title}>{title}</h3>}
  </div>
);

// Content component is composed inside FeatureCard
const FeatureCardContent = ({ children }) => (
  <div className={styles.content}>
    {children}
  </div>
);

// Footer component is composed inside FeatureCard
const FeatureCardFooter = ({ children }) => (
  <div className={styles.footer}>
    {children}
  </div>
);

// Main component acts as a container for composable parts
const FeatureCard = ({ className = '', children, onClick, ...props }) => {
  const cardClassName = `${styles.card} ${className}`.trim();
  
  return (
    <div 
      className={cardClassName} 
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Attach sub-components to enable composition pattern
FeatureCard.Header = FeatureCardHeader;
FeatureCard.Content = FeatureCardContent;
FeatureCard.Footer = FeatureCardFooter;

FeatureCard.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func
};

export default FeatureCard;
