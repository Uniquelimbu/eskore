import React from 'react';
import './SidebarToggle.css';

const SidebarToggle = ({ isOpen, toggleSidebar }) => {
  return (
    <button 
      className={`sidebar-mobile-toggle ${isOpen ? 'open' : ''}`}
      onClick={toggleSidebar}
      aria-label={isOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
      aria-expanded={isOpen}
    >
      <span className="toggle-bar"></span>
      <span className="toggle-bar"></span>
      <span className="toggle-bar"></span>
      <span className="visually-hidden">
        {isOpen ? 'Close menu' : 'Open menu'}
      </span>
    </button>
  );
};

export default SidebarToggle;
