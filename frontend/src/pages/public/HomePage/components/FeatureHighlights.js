import React from 'react';

const FeatureHighlights = () => {
  const features = [
    {
      id: 1,
      title: 'Performance Analytics',
      description: 'Detailed statistics and analytics to track your improvement over time',
      icon: '📊'
    },
    {
      id: 2,
      title: 'Match History',
      description: 'Comprehensive record of all your matches with detailed insights',
      icon: '🎮'
    },
    {
      id: 3,
      title: 'Pro Comparisons',
      description: 'Compare your stats with professional players to identify areas for growth',
      icon: '⭐'
    }
  ];

  return (
    <div className="features-section">
      <h2>Why Choose eSkore?</h2>
      <div className="features-grid">
        {features.map(feature => (
          <div key={feature.id} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureHighlights;
