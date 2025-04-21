import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import './MatchesPage.css';

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  useEffect(() => {
    // Simulate API call to fetch matches
    setTimeout(() => {
      const mockMatches = [
        {
          id: 1,
          homeTeam: { name: 'Barcelona FC', logo: '⚽' },
          awayTeam: { name: 'Real Madrid', logo: '⚽' },
          date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          time: '19:45',
          venue: 'Camp Nou',
          league: 'La Liga',
          status: 'upcoming'
        },
        {
          id: 2,
          homeTeam: { name: 'Liverpool', logo: '⚽' },
          awayTeam: { name: 'Manchester United', logo: '⚽' },
          date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          time: '20:00',
          venue: 'Anfield',
          league: 'Premier League',
          status: 'upcoming'
        },
        {
          id: 3,
          homeTeam: { name: 'Arsenal', logo: '⚽', score: 2 },
          awayTeam: { name: 'Chelsea', logo: '⚽', score: 1 },
          date: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          time: 'FT',
          venue: 'Emirates Stadium',
          league: 'Premier League',
          status: 'completed'
        },
        {
          id: 4,
          homeTeam: { name: 'Bayern Munich', logo: '⚽', score: 3 },
          awayTeam: { name: 'Borussia Dortmund', logo: '⚽', score: 2 },
          date: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          time: 'FT',
          venue: 'Allianz Arena',
          league: 'Bundesliga',
          status: 'completed'
        },
        {
          id: 5,
          homeTeam: { name: 'Paris Saint-Germain', logo: '⚽' },
          awayTeam: { name: 'Marseille', logo: '⚽' },
          date: new Date().toLocaleDateString(),
          time: '20:45',
          venue: 'Parc des Princes',
          league: 'Ligue 1',
          status: 'live',
          minute: '32'
        }
      ];
      
      setMatches(mockMatches);
      setLoading(false);
    }, 1500);
  }, []);
  
  // Filter matches based on active tab
  const filteredMatches = matches.filter(match => {
    if (activeTab === 'upcoming') return match.status === 'upcoming';
    if (activeTab === 'live') return match.status === 'live';
    if (activeTab === 'completed') return match.status === 'completed';
    return true;
  });
  
  return (
    <div className="matches-page animate-fade-in">
      <Helmet>
        <title>Matches - eSkore</title>
        <meta name="description" content="Browse upcoming, live, and past football matches on eSkore." />
      </Helmet>
      
      <div className="matches-container">
        <header className="page-header">
          <h1 className="page-title animate-slide-up">Matches</h1>
        </header>
        
        {/* Tabs */}
        <div className="match-tabs">
          <button 
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`} 
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`tab-button ${activeTab === 'live' ? 'active' : ''}`} 
            onClick={() => setActiveTab('live')}
          >
            Live
          </button>
          <button 
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`} 
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>
        
        {/* Match List */}
        <div className="matches-list">
          {loading ? (
            <div className="loading-container" aria-live="polite" role="status">
              <div className="loading-spinner"></div>
              <p>Loading matches...</p>
            </div>
          ) : filteredMatches.length > 0 ? (
            filteredMatches.map(match => (
              <div key={match.id} className={`match-card ${match.status === 'live' ? 'live-match' : ''}`}>
                <div className="match-header">
                  <div className="match-league">{match.league}</div>
                  {match.status === 'live' && (
                    <div className="live-indicator">
                      <span className="live-dot"></span>
                      LIVE {match.minute}'
                    </div>
                  )}
                </div>
                
                <div className="match-content">
                  <div className="team home-team">
                    <div className="team-logo">{match.homeTeam.logo}</div>
                    <div className="team-name">{match.homeTeam.name}</div>
                    {match.status !== 'upcoming' && (
                      <div className="team-score">{match.homeTeam.score}</div>
                    )}
                  </div>
                  
                  <div className="match-details">
                    <div className="match-date">{match.date}</div>
                    <div className="match-time">{match.time}</div>
                    <div className="match-venue">{match.venue}</div>
                  </div>
                  
                  <div className="team away-team">
                    {match.status !== 'upcoming' && (
                      <div className="team-score">{match.awayTeam.score}</div>
                    )}
                    <div className="team-logo">{match.awayTeam.logo}</div>
                    <div className="team-name">{match.awayTeam.name}</div>
                  </div>
                </div>
                
                <div className="match-footer">
                  <button className="match-action-btn">
                    {match.status === 'upcoming' ? 'Set Reminder' : 'Match Details'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-matches-message">
              <p>No {activeTab} matches found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MatchesPage;
