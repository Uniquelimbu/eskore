import React, { useState, useEffect } from 'react';
import './SearchFilters.css';

const SearchFilters = ({ currentQuery, currentType, onSearchChange, onTypeChange }) => {
  const [localQuery, setLocalQuery] = useState(currentQuery);
  
  // Sync local state with URL params when they change externally
  useEffect(() => {
    setLocalQuery(currentQuery);
  }, [currentQuery]);
  
  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    
    // Debounce search to avoid excessive API calls
    const timeoutId = setTimeout(() => {
      onSearchChange(value);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };
  
  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchChange(localQuery);
  };
  
  return (
    <div className="search-filters">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search for athletes, teams..."
            value={localQuery}
            onChange={handleInputChange}
            aria-label="Search query"
          />
          <button type="submit" className="search-button">
            <span role="img" aria-label="Search">🔍</span>
          </button>
        </div>
      </form>
      
      <div className="filter-options">
        <div className="filter-group">
          <label>Type:</label>
          <div className="filter-buttons">
            <button 
              className={`filter-button ${currentType === 'all' ? 'active' : ''}`}
              onClick={() => onTypeChange('all')}
            >
              All
            </button>
            <button 
              className={`filter-button ${currentType === 'athlete' ? 'active' : ''}`}
              onClick={() => onTypeChange('athlete')}
            >
              Athletes
            </button>
            <button 
              className={`filter-button ${currentType === 'team' ? 'active' : ''}`}
              onClick={() => onTypeChange('team')}
            >
              Teams
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
