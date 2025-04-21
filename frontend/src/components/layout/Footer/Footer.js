import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { eskore_logo } from '../../../assets';

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically call an API to handle the subscription
    // For now, we'll just show a success message
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          {/* Logo and Description */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src={eskore_logo} alt="eSkore Logo" />
              <span>eSkore</span>
            </Link>
            <p className="company-description">
              The digital platform where grassroots players get discovered, coaches find talent, 
              and teams build communities.
            </p>
            
            {/* Social Media Links */}
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85 0-3.2.01-3.58.07-4.85.15-3.23 1.67-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07c-4.38.2-6.78 2.62-6.98 6.98C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.38-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.38-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84c-3.4 0-6.16 2.76-6.16 6.16 0 3.4 2.76 6.16 6.16 6.16 3.4 0 6.16-2.76 6.16-6.16 0-3.4-2.76-6.16-6.16-6.16zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm4.93-11.92c-.8 0-1.44.64-1.44 1.44s.64 1.44 1.44 1.44 1.44-.64 1.44-1.44-.64-1.44-1.44-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/teams">Teams</Link></li>
              <li><Link to="/leagues">Leagues</Link></li>
              <li><Link to="/matches">Live Matches</Link></li>
              <li><Link to="/standings">Standings</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="footer-newsletter">
            <h3>Stay Updated</h3>
            {subscribed ? (
              <div className="subscription-success">Thanks for subscribing!</div>
            ) : (
              <form onSubmit={handleSubmit} className="newsletter-form">
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit">Subscribe</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright">&copy; {currentYear} eSkore. All rights reserved.</p>
          <ul className="legal-links">
            <li><Link to="/terms">Terms</Link></li>
            <li><Link to="/privacy">Privacy</Link></li>
            <li><Link to="/cookies">Cookies</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
