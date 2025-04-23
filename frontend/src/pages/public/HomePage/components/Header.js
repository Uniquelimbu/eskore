import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ forceHidden }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 80); // Delay appearance until user scrolls 80px
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`home-header${forceHidden ? ' home-header--hidden' : ''}`}>
      <div className="home-header__container">
        <div className="home-header__logo">
          <img
            src={`${process.env.PUBLIC_URL}/images/logos/eskore-logo.png`}
            alt="eSkore Logo"
            className="home-header__logo-image"
          />
          <span className="home-header__logo-text">eSkore</span>
        </div>
        <Link
          to="/role-selection"
          className={`home-header__get-started${showButton ? ' visible' : ''}`}
          tabIndex={showButton ? 0 : -1}
          aria-hidden={!showButton}
        >
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default Header;
