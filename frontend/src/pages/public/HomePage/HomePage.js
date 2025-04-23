import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
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
        {/* CTA Section */}
        <div className="cta-section">
          <h2>Ready to elevate your eSports career?</h2>
          <p>Join thousands of athletes tracking their progress with eSkore</p>
          <div className="cta-buttons">
            {/* Wrap primary button in Link */}
            <Link to="/role-selection" className="primary-cta-button">
              Get Started
            </Link>
            {/* Keep secondary as button or link to /contact */}
            <Link to="/contact" className="secondary-cta-button">
              Contact Sales
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
