import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { UserPageLayout } from '../../../features/shared/components/UserPageLayout/UserPageLayout';
import './StatsPage.css';

function StatsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    summary: {
      matches: 12,
      goals: 7,
      assists: 5,
      minutesPlayed: 1035,
      yellowCards: 2,
      redCards: 0
    },
    performanceMetrics: {
      passing: 85,
      shooting: 78,
      dribbling: 82,
      defending: 65,
      physical: 75,
      pace: 88
    },
    recentPerformance: [
      { match: 'FC United vs City FC', date: '2023-05-30', rating: 8.5, goals: 2, assists: 0 },
      { match: 'Athletic Club vs FC United', date: '2023-05-23', rating: 7.2, goals: 0, assists: 1 },
      { match: 'FC United vs Regional FC', date: '2023-05-16', rating: 9.0, goals: 1, assists: 2 },
      { match: 'Metro City vs FC United', date: '2023-05-09', rating: 6.8, goals: 0, assists: 0 }
    ],
    seasonProgression: [
      { month: 'Jan', rating: 7.2 },
      { month: 'Feb', rating: 7.5 },
      { month: 'Mar', rating: 7.8 },
      { month: 'Apr', rating: 8.2 },
      { month: 'May', rating: 8.4 }
    ]
  });

  // Fetch stats data
  useEffect(() => {
    // In a real app, fetch data from API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <UserPageLayout
      title="My Stats"
      description="View your performance statistics and metrics"
    >
      <div className="stats-page">
        <h1 className="page-title">My Statistics</h1>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading stats...</p>
          </div>
        ) : (
          <>
            {/* Key Performance Indicators */}
            <div className="stats-summary-grid">
              <div className="stat-card">
                <div className="stat-name">Matches</div>
                <div className="stat-value">{stats.summary.matches}</div>
              </div>
              <div className="stat-card">
                <div className="stat-name">Goals</div>
                <div className="stat-value">{stats.summary.goals}</div>
              </div>
              <div className="stat-card">
                <div className="stat-name">Assists</div>
                <div className="stat-value">{stats.summary.assists}</div>
              </div>
              <div className="stat-card">
                <div className="stat-name">Minutes</div>
                <div className="stat-value">{stats.summary.minutesPlayed}</div>
              </div>
              <div className="stat-card">
                <div className="stat-name">Yellow Cards</div>
                <div className="stat-value">{stats.summary.yellowCards}</div>
              </div>
              <div className="stat-card">
                <div className="stat-name">Red Cards</div>
                <div className="stat-value">{stats.summary.redCards}</div>
              </div>
            </div>
            
            {/* Performance Radar Chart */}
            <div className="stats-section">
              <h2>Performance Metrics</h2>
              <div className="performance-metrics">
                {Object.entries(stats.performanceMetrics).map(([metric, value]) => (
                  <div className="metric-item" key={metric}>
                    <div className="metric-name">{metric.charAt(0).toUpperCase() + metric.slice(1)}</div>
                    <div className="metric-bar-container">
                      <div 
                        className="metric-bar" 
                        style={{ width: `${value}%`, backgroundColor: getMetricColor(value) }}
                      ></div>
                    </div>
                    <div className="metric-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Performance */}
            <div className="stats-section">
              <h2>Recent Performances</h2>
              <div className="performance-table-container">
                <table className="performance-table">
                  <thead>
                    <tr>
                      <th>Match</th>
                      <th>Date</th>
                      <th>Rating</th>
                      <th>Goals</th>
                      <th>Assists</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPerformance.map((match, index) => (
                      <tr key={index}>
                        <td>{match.match}</td>
                        <td>{match.date}</td>
                        <td>
                          <div className="rating-badge" style={{ backgroundColor: getRatingColor(match.rating) }}>
                            {match.rating.toFixed(1)}
                          </div>
                        </td>
                        <td>{match.goals}</td>
                        <td>{match.assists}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Season Progression Chart */}
            <div className="stats-section">
              <h2>Season Progression</h2>
              <div className="season-chart">
                {stats.seasonProgression.map((month, index) => (
                  <div className="chart-bar-container" key={index}>
                    <div 
                      className="chart-bar" 
                      style={{ 
                        height: `${(month.rating / 10) * 100}%`,
                        backgroundColor: getRatingColor(month.rating)
                      }}
                    >
                      <span className="bar-value">{month.rating.toFixed(1)}</span>
                    </div>
                    <div className="bar-label">{month.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </UserPageLayout>
  );
}

// Helper functions for styling
function getMetricColor(value) {
  if (value >= 85) return '#28a745';
  if (value >= 70) return '#17a2b8';
  if (value >= 60) return '#ffc107';
  return '#dc3545';
}

function getRatingColor(rating) {
  if (rating >= 8.5) return '#28a745';
  if (rating >= 7.5) return '#17a2b8';
  if (rating >= 6.5) return '#ffc107';
  return '#dc3545';
}

export default StatsPage;
