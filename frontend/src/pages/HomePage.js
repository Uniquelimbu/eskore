import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './HomePage.css';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [heroActive, setHeroActive] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const heroRef = useRef(null);

  // Handle loading states
  useEffect(() => {
    // Simulate loading critical assets
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Activate hero section after a brief delay
      setTimeout(() => {
        setHeroActive(true);
      }, 200);
    }, 500); // Reduced loading time for better UX

    return () => clearTimeout(timer);
  }, []);

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className={`landing-page ${isLoading ? 'loading-hero' : 'page-ready'}`}>
      <Helmet>
        <title>eSkore - Digital Platform for Grassroots Football</title>
        <meta 
          name="description" 
          content="eSkore - The digital platform where players get discovered, coaches find talent, and teams build communities." 
        />
        {/* Add any other meta tags for SEO optimization */}
      </Helmet>

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        {/* Background Shapes */}
        <div className="hero-background-shapes" aria-hidden="true">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        {/* Hero Content */}
        <div className={`hero-content ${heroActive ? 'active' : ''}`}>
          <h1 className="hero-heading">
            The Digital Home for Grassroots Football
          </h1>
          <p className="hero-subtitle">
            Connect players, coaches, and teams through a unified platform that makes 
            tracking matches, discovering talent, and building communities easier than ever.
          </p>
          <div className="hero-cta">
            <Link to="/role-selection" className="cta-button">
              Get Started
              <span className="cta-arrow">→</span>
            </Link>
            <Link to="/matches" className="cta-button" style={{ background: "var(--color-accent, #FF6B6B)" }}>
              Explore Matches
            </Link>
          </div>
        </div>

        {/* Hero Image - App Mockup */}
        <div className={`hero-image ${heroActive ? 'active' : ''}`}>
          <div className="hero-image-wrapper">
            <img 
              src={require('../assets/images/mockups/eskore-mockup.png')} // Use require for webpack to resolve
              alt="eSkore mobile app showing match statistics" 
              className={`hero-mockup-image${imageLoaded ? ' loaded' : ''}`}
              onLoad={handleImageLoad}
              style={{ width: '100%', maxWidth: 420, borderRadius: 24, boxShadow: '0 8px 32px rgba(46,31,94,0.08)', background: '#fff', opacity: 1 }}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="social-proof-section">
        <div className="stats-container">
          <div className="stat-item animate-fade-in">
            <div className="stat-value">10,000+</div>
            <div className="stat-label">Active Players</div>
          </div>
          <div className="stat-item animate-fade-in delay-100">
            <div className="stat-value">500+</div>
            <div className="stat-label">Teams</div>
          </div>
          <div className="stat-item animate-fade-in delay-200">
            <div className="stat-value">250+</div>
            <div className="stat-label">Tournaments</div>
          </div>
          <div className="stat-item animate-fade-in delay-300">
            <div className="stat-value">98%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title animate-fade-in">Features Designed for Football</h2>
        <div className="features-grid">
          <div className="feature-card animate-fade-in">
            <div className="feature-icon">📊</div>
            <h3>Match Statistics</h3>
            <p>Track real-time match data, player performance, and team statistics in one place.</p>
          </div>
          <div className="feature-card animate-fade-in delay-100">
            <div className="feature-icon">👤</div>
            <h3>Player Profiles</h3>
            <p>Create comprehensive profiles highlighting skills, achievements, and career history.</p>
          </div>
          <div className="feature-card animate-fade-in delay-200">
            <div className="feature-icon">🏆</div>
            <h3>League Management</h3>
            <p>Organize leagues and tournaments with automated scheduling and standings.</p>
          </div>
          <div className="feature-card animate-fade-in delay-300">
            <div className="feature-icon">🔍</div>
            <h3>Talent Discovery</h3>
            <p>Help coaches and scouts find promising players based on performance data.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step animate-fade-in">
            <div className="step-number">1</div>
            <h3>Create Profile</h3>
            <p>Set up your profile as a player, coach, or team to start connecting with the community.</p>
          </div>
          <div className="step animate-fade-in delay-100">
            <div className="step-number">2</div>
            <h3>Record Matches</h3>
            <p>Track match stats, record performance data, and build your digital sports résumé.</p>
          </div>
          <div className="step animate-fade-in delay-200">
            <div className="step-number">3</div>
            <h3>Grow Network</h3>
            <p>Connect with teams, join leagues, and get discovered by coaches and scouts.</p>
          </div>
        </div>
      </section>

      {/* App Download Section - Uncomment when mobile app is available */}
      {/* <section className="app-download-section">
        <div className="app-download-content">
          <h2 className="animate-fade-in">Download Our Mobile App</h2>
          <p className="app-download-subtitle animate-fade-in delay-100">
            Take eSkore with you everywhere. Track matches, check stats, and stay connected on the go.
          </p>
          <div className="app-store-buttons animate-fade-in delay-200">
            <a href="#" className="app-store-button">
              <div className="store-button-logo">
                <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.86 15.37 3.6 7.8 8.42 7.58c1.2-.07 2.02.26 2.76.69.4.23.77.45 1.32.45.52 0 .86-.2 1.23-.4.75-.41 1.62-.79 2.85-.67 1.06.1 2.01.42 2.71 1.18-2.4 1.44-2.08 5.22.33 6.37-.88 1.9-1.91 3.76-3.57 5.08zM12.03 6.92c-.05-2.03 1.65-3.93 3.77-4.13.27 2.02-1.3 3.94-3.77 4.13z"/>
                </svg>
              </div>
              <div className="store-button-content">
                <span className="store-button-small">Download on the</span>
                <span className="store-button-large">App Store</span>
              </div>
            </a>
            <a href="#" className="play-store-button">
              <div className="store-button-logo">
                <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                  <path d="M3.18 20.83c.44.36 1.04.41 1.53.12l.07-.04 8.59-4.76-2.74-2.76-7.45 7.44zm.71-16.98C3.35 4.2 3 4.85 3 5.58v12.83c0 .36.05.69.17.98l7.72-7.5-7-4.04zm10.28 2.24L6.52 2.15l-.1-.05c-.55-.31-1.21-.24-1.67.19l7.42 7.8zM20.1 12l-2.8-1.55-2.99 2.96 3.04 3.06L20.1 15c.81-.46 1.15-1.39 1.15-1.99 0-.6-.34-1.55-1.15-2.01z"/>
                </svg>
              </div>
              <div className="store-button-content">
                <span className="store-button-small">GET IT ON</span>
                <span className="store-button-large">Google Play</span>
              </div>
            </a>
          </div>
        </div>
      </section> */}

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <h2 className="animate-fade-in">Ready to Join the Community?</h2>
        <p className="animate-fade-in delay-100">
          Take your football journey to the next level with eSkore. Create your profile, join teams, and get discovered.
        </p>
        <Link to="/role-selection" className="cta-button button-pulse animate-fade-in delay-200">
          Get Started Today <span className="cta-arrow">→</span>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;