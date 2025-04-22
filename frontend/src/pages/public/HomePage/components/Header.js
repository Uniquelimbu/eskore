import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Always check scroll position from window
      if (window.scrollY > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    // Attach scroll event
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check in case user reloads while scrolled
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`home-header${scrolled ? ' scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo-container">
          <img 
            src={`${process.env.PUBLIC_URL}/images/logos/eskore-logo.png`} 
            alt="eSkore Logo" 
            className="logo-image"
          />
          <span className="logo-text">eSkore</span>
        </div>
        {scrolled && (
          <Link to="/role-selection" className="header-get-started">
            Get Started
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
