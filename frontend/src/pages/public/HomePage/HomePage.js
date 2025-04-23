import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeatureHighlights from './components/FeatureHighlights';
import TrackAnywhere from './components/TrackAnywhere'; 
import Footer from './components/Footer';
import './HomePage.css';

const HomePage = () => {
  const [hideHeader, setHideHeader] = useState(false);
  const trackAnywhereRef = useRef(null);
  
  // Set up intersection observer to detect when Track Anywhere section is visible
  useEffect(() => {
    if (!trackAnywhereRef.current) return;
    
    const options = {
      // Adjust rootMargin to not trigger early at the top
      rootMargin: '0px 0px -10% 0px', 
      // Increase threshold so it requires more of the section to be visible
      threshold: 0.6 // Trigger when 60% of the element is visible (was 0.3)
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // If the section is intersecting (visible), hide the header
        // Otherwise, show it
        setHideHeader(entry.isIntersecting);
      });
    }, options);
    
    observer.observe(trackAnywhereRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="home-page">
      {/* Pass hideHeader state to Header component */}
      <Header forceHidden={hideHeader} />
      <main className="home-content">
        <HeroSection />
        <div id="features" className="content-section">
          <FeatureHighlights />
        </div>
        
        {/* Add ref to the TrackAnywhere component */}
        <div ref={trackAnywhereRef}>
          <TrackAnywhere /> 
        </div>

        {/* Existing CTA Section */}
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
