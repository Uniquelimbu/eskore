import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeatureHighlights from './components/FeatureHighlights';
import Footer from './components/Footer';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Header is positioned absolutely via CSS */}
      <Header />
      <main className="home-content">
        <HeroSection />
        <div id="features" className="content-section">
          <FeatureHighlights />
        </div>
        <div className="cta-section">
          <h2>Ready to elevate your eSports career?</h2>
          <p>Join thousands of athletes tracking their progress with eSkore</p>
          <div className="cta-buttons">
            <button className="primary-cta-button">Get Started</button>
            <button className="secondary-cta-button">Contact Sales</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
