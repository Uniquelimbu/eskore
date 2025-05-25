import React from 'react';
import { Link } from 'react-router-dom';
import './SearchResults.css';

const SearchResults = ({ results, query, type }) => {
  // Function to highlight the search query in text
  const highlightMatch = (text) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="highlight">{part}</span> : part
    );
  };
  
  // Get position display name
  const getPositionName = (code) => {
    const positions = {
      'GK': 'Goalkeeper',
      'DF': 'Defender',
      'MF': 'Midfielder',
      'FW': 'Forward'
    };
    return positions[code] || code;
  };
  
  // Render a single athlete result card
  const renderAthleteCard = (athlete) => (
    <Link to={`/athlete/${athlete.id}`} className="result-card" key={`athlete-${athlete.id}`}>
      <div className="result-image">
        <img src={athlete.image} alt={athlete.name} />
      </div>
      <div className="result-content">
        <h3 className="result-title">{highlightMatch(athlete.name)}</h3>
        <div className="result-details">
          <span className="result-tag">Athlete</span>
          {athlete.position && (
            <span className="result-info">{getPositionName(athlete.position)}</span>
          )}
          {athlete.country && (
            <span className="result-info">{highlightMatch(athlete.country)}</span>
          )}
        </div>
      </div>
    </Link>
  );
  
  // Render a single team result card
  const renderTeamCard = (team) => (
    <Link to={`/team/${team.id}`} className="result-card" key={`team-${team.id}`}>
      <div className="result-image team-image">
        <img src={team.image} alt={team.name} />
      </div>
      <div className="result-content">
        <h3 className="result-title">{highlightMatch(team.name)}</h3>
        <div className="result-details">
          <span className="result-tag team-tag">Team</span>
          {team.teamIdentifier && (
            <span className="result-id">{highlightMatch(team.teamIdentifier)}</span>
          )}
          {team.league && (
            <span className="result-info">{highlightMatch(team.league)}</span>
          )}
          {team.country && (
            <span className="result-info">{highlightMatch(team.country)}</span>
          )}
        </div>
      </div>
    </Link>
  );
  
  // Determine what to render based on results
  if (results.length === 0 && query) {
    return (
      <div className="no-results">
        <div className="no-results-icon">🔍</div>
        <h3>No results found</h3>
        <p>We couldn't find any matches for "{query}"</p>
        <div className="search-suggestions">
          <p>Suggestions:</p>
          <ul>
            <li>Check your spelling</li>
            <li>Try more general terms</li>
            <li>Try different keywords</li>
            <li>Try changing the filter type</li>
          </ul>
        </div>
      </div>
    );
  }
  
  if (results.length === 0 && !query) {
    return (
      <div className="search-empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3>Search for athletes and teams</h3>
        <p>Enter a name, position, country, or league in the search box above</p>
      </div>
    );
  }
  
  return (
    <div className="search-results">
      <div className="results-header">
        <h2>Results {query ? `for "${query}"` : ''}</h2>
        <span className="results-count">{results.length} {results.length === 1 ? 'result' : 'results'}</span>
      </div>
      
      <div className="results-grid">
        {results.map(result => {
          if (result.type === 'athlete') {
            return renderAthleteCard(result);
          } else if (result.type === 'team') {
            return renderTeamCard(result);
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default SearchResults;
