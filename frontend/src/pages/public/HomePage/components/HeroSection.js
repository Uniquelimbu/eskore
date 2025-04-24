import React, { useRef } from 'react';
import GetStartedButton from './GetStartedButton';
import './HeroSection.css';

const HeroSection = ({ onLoginClick }) => {
  const imgRef = useRef(null);
  const heroImgPath = `${process.env.PUBLIC_URL}/images/mockups/eskore-mockup.png`;

  return (
    <div className="hero-section">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            <span>Track,</span>
            <span>Analyze,</span>
            <span>Dominate</span>
          </h1>
          <p className="hero-description">
            The ultimate eSports performance tracking platform for serious gamers
          </p>
          <div className="hero-buttons">
            <GetStartedButton />
            <button
              type="button"
              className="existing-account-button"
              onClick={onLoginClick}
            >
              I already have an Account
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img 
            ref={imgRef}
            src={heroImgPath}
            alt="eSkore Dashboard Preview"
            onError={(e) => {
              console.warn('Image load error, using fallback');
              e.target.onerror = null;
              e.target.src = `${process.env.PUBLIC_URL}/logo192.png`;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
