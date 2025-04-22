import React from 'react';
import GetStartedButton from './GetStartedButton';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Track, Analyze, Dominate</h1>
        <p>The ultimate eSports performance tracking platform for serious gamers</p>
        <GetStartedButton />
      </div>
      <div className="hero-image">
        {/* Hero image would go here */}
      </div>
    </div>
  );
};

export default HeroSection;
