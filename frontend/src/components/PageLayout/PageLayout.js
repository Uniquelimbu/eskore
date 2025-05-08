import React from 'react';
import './PageLayout.css';

const PageLayout = ({ 
  children, 
  className = '', 
  maxWidth = '1200px', 
  withPadding = true 
}) => {
  return (
    <main 
      className={`page-layout ${className} ${withPadding ? 'with-padding' : ''}`}
      style={{ maxWidth }}
    >
      {children}
    </main>
  );
};

export default PageLayout;
