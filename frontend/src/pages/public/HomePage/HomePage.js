import React from 'react';
import HeroSection from './components/HeroSection';
import FeatureHighlights from './components/FeatureHighlights';
import GetStartedButton from './components/GetStartedButton';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <FeatureHighlights />
      <div className="cta-section">
        <h2>Ready to elevate your eSports career?</h2>
        <p>Join thousands of athletes tracking their progress with eSkore</p>
        <GetStartedButton />
      </div>
    </div>
  );
};

export default HomePage;
