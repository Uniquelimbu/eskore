import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { AthletePageLayout } from '../components/PageLayout';
import './MatchesPage.css';

function MatchesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [matches, setMatches] = useState({
    upcoming: [
      { id: 1, date: '2023-06-15T15:00:00', opponent: 'FC United', location: 'Home Stadium', type: 'League' },
      { id: 2, date: '2023-06-22T18:30:00', opponent: 'City FC', location: 'Away Field', type: 'Cup' }
    ],
    past: [
      { id: 3, date: '2023-05-15T14:00:00', opponent: 'FC United', result: 'W 2-1', stats: { goals: 1, assists: 0, minutesPlayed: 90 } },
      { id: 4, date: '2023-05-08T16:00:00', opponent: 'City FC', result: 'L 0-3', stats: { goals: 0, assists: 0, minutesPlayed: 72 } },
      { id: 5, date: '2023-04-30T15:00:00', opponent: 'Athletic Club', result: 'W 3-0', stats: { goals: 2, assists: 1, minutesPlayed: 90 } }
    ]
  });

  // Fetch matches data
  useEffect(() => {
    const fetchMatchesData = async () => {
      try {
        // In a real app, this would be an API call to fetch matches
        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setLoading(false);
      }
    };

    fetchMatchesData();
  }, [user]);

  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <AthletePageLayout
      title="My Matches"
      description="View your upcoming and past matches"
    >
      <div className="athlete-matches-page">
        <h1 className="page-title">My Matches</h1>
        
        <div className="matches-tabs">
          <button 
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Matches
          </button>
          <button 
            className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Matches
          </button>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading matches...</p>
          </div>
        ) : (
          <div className="matches-content">
            {activeTab === 'upcoming' && (
              <>
                <h2 className="section-title">Upcoming Matches</h2>
                {matches.upcoming.length === 0 ? (
                  <div className="empty-state">
                    <p>No upcoming matches scheduled.</p>
                  </div>
                ) : (
                  <div className="matches-grid">
                    {matches.upcoming.map(match => (
                      <div className="match-card" key={match.id}>
                        <div className="match-header">
                          <span className="match-type">{match.type}</span>
                          <span className="match-date">{formatDate(match.date)}</span>
                        </div>
                        <div className="match-teams">
                          <div className="team home-team">Your Team</div>
                          <div className="vs">vs</div>
                          <div className="team away-team">{match.opponent}</div>
                        </div>
                        <div className="match-footer">
                          <div className="match-venue">
                            <i className="location-icon">📍</i>
                            {match.location}
                          </div>
                          <button className="match-action-button">Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'past' && (
              <>
                <h2 className="section-title">Past Matches</h2>
                {matches.past.length === 0 ? (
                  <div className="empty-state">
                    <p>No past matches found.</p>
                  </div>
                ) : (
                  <div className="matches-list">
                    {matches.past.map(match => (
                      <div className="past-match-card" key={match.id}>
                        <div className="match-info">
                          <div className="match-date-result">
                            <span className="match-date">{new Date(match.date).toLocaleDateString()}</span>
                            <span className={`match-result ${match.result.startsWith('W') ? 'win' : match.result.startsWith('L') ? 'loss' : 'draw'}`}>
                              {match.result}
                            </span>
                          </div>
                          <div className="match-teams">
                            <div className="team home-team">Your Team</div>
                            <div className="vs">vs</div>
                            <div className="team away-team">{match.opponent}</div>
                          </div>
                        </div>
                        <div className="player-stats">
                          <div className="stat">
                            <span className="stat-label">Goals</span>
                            <span className="stat-value">{match.stats.goals}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Assists</span>
                            <span className="stat-value">{match.stats.assists}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Minutes</span>
                            <span className="stat-value">{match.stats.minutesPlayed}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </AthletePageLayout>
  );
}

export default MatchesPage;
