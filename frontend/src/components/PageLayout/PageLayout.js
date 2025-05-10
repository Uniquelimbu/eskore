import React from 'react';
import './PageLayout.css';

const PageLayout = ({ children, className = '', maxWidth = '1200px', withPadding = true }) => {
  return (
    <div 
      className={`page-layout ${className}${withPadding ? ' page-layout--with-padding' : ''}`}
    >
      <div
        className="page-layout__container"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
