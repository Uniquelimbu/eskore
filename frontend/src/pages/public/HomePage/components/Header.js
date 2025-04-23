import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { classNames } from '../../../../utils/cssUtils';
import './Header.css';

const Header = ({ forceHidden }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Memoized scroll handler for better performance
  const handleScroll = useCallback(() => {
    // Use a small threshold to consider as scrolled
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    // Initial check in case page loads scrolled
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    };
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Create dynamic classes
  const headerClass = classNames(
    'home-header',
    scrolled && 'home-header--scrolled',
    forceHidden && 'home-header--hidden',
    isMobileMenuOpen && 'home-header--menu-open'
  );

  return (
    <header className={headerClass}>
      <div className="home-header__container">
        <div className="home-header__logo">
          <Link to="/" className="home-header__logo-link">
            <img
              src={`${process.env.PUBLIC_URL}/images/logos/eskore-logo.png`}
              alt="eSkore Logo"
              className="home-header__logo-image"
              width="36"
              height="36"
            />
            <span className="home-header__logo-text">eSkore</span>
          </Link>
        </div>

        <nav className={`home-header__nav ${isMobileMenuOpen ? 'home-header__nav--open' : ''}`}>
          <ul className="home-header__nav-list">
            <li className="home-header__nav-item">
              <a href="#features" className="home-header__nav-link">Features</a>
            </li>
            <li className="home-header__nav-item">
              <Link to="/pricing" className="home-header__nav-link">Pricing</Link>
            </li>
            <li className="home-header__nav-item">
              <Link to="/blog" className="home-header__nav-link">Blog</Link>
            </li>
            <li className="home-header__nav-item">
              <Link to="/contact" className="home-header__nav-link">Contact</Link>
            </li>
          </ul>
        </nav>

        <div className="home-header__actions">
          <Link to="/login" className="home-header__login-link">
            Log in
          </Link>
          <Link to="/role-selection" className="home-header__get-started">
            Get Started
          </Link>
          <button 
            className={`home-header__mobile-toggle ${isMobileMenuOpen ? 'open' : ''}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  forceHidden: PropTypes.bool
};

export default Header;
