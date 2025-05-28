import React, { useState, useEffect, useRef } from 'react';
import './SearchFilters.css';

const SearchFilters = ({ currentQuery, currentType, onSearchChange, onTypeChange }) => {
  const [localQuery, setLocalQuery] = useState(currentQuery);
  
  // Sync local state with URL params when they change externally (but avoid cursor jumps)
  useEffect(() => {
    // Only update if currentQuery changed programmatically (not from user typing)
    setLocalQuery(currentQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuery]);
  
  const handleInputChange = (e) => {
    setLocalQuery(e.target.value);
  };
  
  // Debounce onSearchChange so we call it only after the user pauses typing
  const debounceRef = useRef(null);
  useEffect(() => {
    // skip on first mount when localQuery === currentQuery
    if (localQuery === currentQuery) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(localQuery);
    }, 300);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQuery]);
  
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
