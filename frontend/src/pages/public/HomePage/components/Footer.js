import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="home-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-container">
              <img 
                src={`${process.env.PUBLIC_URL}/images/logos/eskore-logo.png`} 
                alt="eSkore Logo" 
                className="footer-logo"
                width="120"
                height="auto"
              />
            </div>
            <p>The ultimate eSports performance tracking platform for athletes, coaches, and teams</p>
            <div className="social-links">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="social-icon">🐦</i>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <i className="social-icon">💬</i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="social-icon">📷</i>
              </a>
            </div>
          </div>
          
          <div className="footer-links">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/testimonials">Testimonials</Link></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {currentYear} eSkore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
