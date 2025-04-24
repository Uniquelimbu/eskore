import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ forceHidden }) => {
  const [showButton, setShowButton] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Refresh homepage on logo click
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.location.reload();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header className={`home-header${forceHidden ? ' home-header--hidden' : ''}`}>
      <div className="home-header__container">
        <a
          href="/"
          className="home-header__logo no-outline"
          aria-label="Go to homepage"
          tabIndex={0}
          onClick={handleLogoClick}
        >
          <img
            src={`${process.env.PUBLIC_URL}/images/logos/eskore-logo.png`}
            alt="eSkore Logo"
            className="home-header__logo-image"
            draggable={false}
          />
          <span className="home-header__logo-text">eSkore</span>
        </a>
        <a
          href="/role-selection"
          className={`home-header__get-started${showButton ? ' visible' : ''}`}
          tabIndex={showButton ? 0 : -1}
          aria-hidden={!showButton}
        >
          Get Started
        </a>
      </div>
    </header>
  );
};

export default Header;
