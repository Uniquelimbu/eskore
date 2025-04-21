import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './LeaguesPage.css';

function LeaguesPage() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  useEffect(() => {
    // Simulate API call to fetch leagues
    setTimeout(() => {
      const mockLeagues = [
        {
          id: 1,
          name: 'Premier League',
          country: 'England',
          teams: 20,
          icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          image: 'premier-league.jpg'
        },
        {
          id: 2,
          name: 'La Liga',
          country: 'Spain',
          teams: 20,
          icon: '🇪🇸',
          image: 'la-liga.jpg'
        },
        {
          id: 3,
          name: 'Bundesliga',
          country: 'Germany',
          teams: 18,
          icon: '🇩🇪',
          image: 'bundesliga.jpg'
        },
        {
          id: 4,
          name: 'Serie A',
          country: 'Italy',
          teams: 20,
          icon: '🇮🇹',
          image: 'serie-a.jpg'
        },
        {
          id: 5,
          name: 'Ligue 1',
          country: 'France',
          teams: 20,
          icon: '🇫🇷',
          image: 'ligue-1.jpg'
        },
        {
          id: 6,
          name: 'Primeira Liga',
          country: 'Portugal',
          teams: 18,
          icon: '🇵🇹',
          image: 'primeira-liga.jpg'
        },
        {
          id: 7,
          name: 'Eredivisie',
          country: 'Netherlands',
          teams: 18,
          icon: '🇳🇱',
          image: 'eredivisie.jpg'
        },
        {
          id: 8,
          name: 'Super Lig',
          country: 'Turkey',
          teams: 20,
          icon: '🇹🇷',
          image: 'super-lig.jpg'
        }
      ];
      
      setLeagues(mockLeagues);
      setLoading(false);
    }, 1500);
  }, []);
  
  // Filter leagues based on search input
  const filteredLeagues = leagues.filter(league => 
    league.name.toLowerCase().includes(filter.toLowerCase()) || 
    league.country.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div className="leagues-page animate-fade-in">
      <Helmet>
        <title>Leagues - eSkore</title>
        <meta name="description" content="Explore football leagues from around the world on eSkore." />
      </Helmet>
      
      <div className="leagues-container">
        <header className="page-header">
          <h1 className="page-title animate-slide-up">Football Leagues</h1>
          <p className="page-description animate-fade-in delay-100">
            Explore leagues from around the world, view standings, and follow your favorite teams.
          </p>
        </header>
        
        {/* Search bar */}
        <div className="search-bar-container animate-fade-in delay-200">
          <input
            type="text"
            className="search-bar"
            placeholder="Search leagues by name or country..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        {/* Leagues grid */}
        <div className="leagues-grid">
          {loading ? (
            <div className="loading-container" aria-live="polite" role="status">
              <div className="loading-spinner"></div>
              <p>Loading leagues...</p>
            </div>
          ) : filteredLeagues.length > 0 ? (
            filteredLeagues.map((league, index) => (
              <Link 
                to={`/leagues/${league.id}`} 
                key={league.id} 
                className="league-card animate-fade-in hover-lift"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="league-icon">{league.icon}</div>
                <h3 className="league-name">{league.name}</h3>
                <div className="league-country">{league.country}</div>
                <div className="league-teams">{league.teams} Teams</div>
                <div className="league-actions">
                  <span className="view-standings">View Standings</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-leagues-message">
              <p>No leagues found matching '{filter}'.</p>
              <button 
                className="clear-search-btn"
                onClick={() => setFilter('')}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaguesPage;
