import React, { useEffect, useRef } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeatureHighlights from './components/FeatureHighlights';
import Footer from './components/Footer';
import './HomePage.css';

const HomePage = () => {
  // Use a ref to track if animations have been initialized
  const animationsInitialized = useRef(false);
  
  // Initialize scroll reveal animations once
  useEffect(() => {
    if (animationsInitialized.current) return;
    
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.reveal:not(.active)');
      
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };
    
    // Run once on initial load with a slight delay
    setTimeout(animateOnScroll, 300);
    
    // Add scroll event listener with throttling for performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          animateOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    animationsInitialized.current = true;
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <div id="features" className="content-section">
        <FeatureHighlights />
      </div>
      <div className="cta-section reveal">
        <h2>Ready to elevate your eSports career?</h2>
        <p>Join thousands of athletes tracking their progress with eSkore</p>
        <div className="cta-buttons">
          <button className="primary-cta-button">Get Started</button>
          <button className="secondary-cta-button">Contact Sales</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
