import React, { useEffect } from 'react';
import './FeatureHighlights.css';

const FeatureHighlights = () => {
  const features = [
    {
      id: 1,
      title: 'Performance Analytics',
      description: 'Detailed statistics and analytics to track your improvement over time',
      icon: '📊',
      imagePath: '/images/analytics-icon.png'
    },
    {
      id: 2,
      title: 'Match History',
      description: 'Comprehensive record of all your matches with detailed insights',
      icon: '🎮',
      imagePath: '/images/match-history-icon.png'
    },
    {
      id: 3,
      title: 'Pro Comparisons',
      description: 'Compare your stats with professional players to identify areas for growth',
      icon: '⭐',
      imagePath: '/images/pro-comparison-icon.png'
    }
  ];

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    const options = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    revealElements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      revealElements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div className="features-section">
      <h2 className="features-heading reveal">Why Choose eSkore?</h2>
      <div className="features-grid stagger-children">
        {features.map(feature => (
          <div key={feature.id} className="feature-card reveal">
            <div className="feature-icon">
              {feature.imagePath ? (
                <img 
                  src={process.env.PUBLIC_URL + feature.imagePath} 
                  alt={feature.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : null}
              <span style={{display: feature.imagePath ? 'none' : 'block'}}>{feature.icon}</span>
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureHighlights;
