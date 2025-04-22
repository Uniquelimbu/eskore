import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Use a small threshold like 10px
      setScrolled(window.scrollY > 10);
    };

    // Initial check in case page loads scrolled
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // Apply scrolled class based on state
    <header className={`home-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo-container">
          <img
            src={`${process.env.PUBLIC_URL}/images/logos/eskore-logo.png`}
            alt="eSkore Logo"
            className="logo-image"
          />
          <span className="logo-text">eSkore</span>
        </div>

        {/* The button is always rendered, CSS handles visibility */}
        <Link to="/role-selection" className="header-get-started">
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default Header;
