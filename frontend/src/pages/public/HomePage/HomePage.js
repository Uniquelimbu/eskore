import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeatureHighlights from './components/FeatureHighlights';
import TrackAnywhere from './components/TrackAnywhere'; 
import Footer from './components/Footer';
import './HomePage.css';

const HomePage = () => {
  const [hideHeader, setHideHeader] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const trackAnywhereRef = useRef(null);
  const navigate = useNavigate();

  // Set up intersection observer to detect when Track Anywhere section is visible
  useEffect(() => {
    if (!trackAnywhereRef.current) return;
    const options = {
      rootMargin: '0px 0px -10% 0px', 
      threshold: 0.6
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setHideHeader(entry.isIntersecting);
      });
    }, options);
    observer.observe(trackAnywhereRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Callback for fade out and navigation
  const handleFadeOutAndNavigate = (to) => {
    setFadeOut(true);
    setTimeout(() => {
      navigate(to);
    }, 500); // Match CSS duration
  };

  return (
    <div className={`home-page${fadeOut ? ' home-fade-out' : ''}`}>
      <Header forceHidden={hideHeader} />
      <main className="home-content">
        <HeroSection onLoginClick={() => handleFadeOutAndNavigate('/login')} />
        <div id="features" className="content-section">
          <FeatureHighlights />
        </div>
        <div ref={trackAnywhereRef}>
          <TrackAnywhere /> 
        </div>
        <div className="cta-section">
          <h2>Ready to elevate your eSports career?</h2>
          <p>Join thousands of athletes tracking their progress with eSkore</p>
          <div className="cta-buttons">
            <Link to="/role-selection" className="primary-cta-button">
              Start Your Journey
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
