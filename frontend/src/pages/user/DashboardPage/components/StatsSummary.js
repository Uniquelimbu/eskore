import React from 'react';

const StatsSummary = ({ stats, loading, onTimeframeChange, currentTimeframe }) => {
  // Only create stat items if stats exists and isn't loading
  const statItems = !loading && stats ? [
    {
      label: 'Total Matches',
      value: stats.totalMatches || 0,
      icon: '🎮'
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate || 0}%`,
      icon: '🏆'
    },
    {
      label: 'KDA Ratio',
      value: stats.kda ? stats.kda.toFixed(1) : '0.0',
      icon: '⚔️'
    },
    {
      label: 'Avg Score',
      value: stats.averageScore || 0,
      icon: '📊'
    }
  ] : [];

  const handleTimeframeSelect = (e) => {
    onTimeframeChange(e.target.value);
  };

  return (
    <div className="stats-summary">
      <div className="section-header">
        <h2>Performance Stats</h2>
        <select 
          className="time-filter" 
          value={currentTimeframe}
          onChange={handleTimeframeSelect}
          disabled={loading}
        >
          <option value="all-time">All Time</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
        </select>
      </div>
      
      {loading ? (
        <div className="stats-loading">
          <div className="loading-spinner"></div>
          <p>Loading stats...</p>
        </div>
      ) : (
        <div className="stats-grid">
          {statItems.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
      
      <button className="view-details-button">View Detailed Stats</button>
    </div>
  );
};

export default StatsSummary;
