import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import SearchFilters from './components/SearchFilters';
import SearchResults from './components/SearchResults';
import Loading from '../../../components/ui/Loading/Loading';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get current search parameters
  const currentQuery = searchParams.get('q') || '';
  const currentType = searchParams.get('type') || 'all';
  
  // Handle search input change
  const handleSearchChange = (query) => {
    const updatedParams = new URLSearchParams(searchParams);
    if (query) {
      updatedParams.set('q', query);
    } else {
      updatedParams.delete('q');
    }
    setSearchParams(updatedParams);
  };
  
  // Handle filter type change
  const handleTypeChange = (type) => {
    const updatedParams = new URLSearchParams(searchParams);
    if (type && type !== 'all') {
      updatedParams.set('type', type);
    } else {
      updatedParams.delete('type');
    }
    setSearchParams(updatedParams);
  };
  
  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!currentQuery.trim()) {
        setSearchResults([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // For now, use mock data - would be replaced with actual API call
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        // Mock search results
        const mockResults = generateMockResults(currentQuery, currentType);
        setSearchResults(mockResults);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to fetch search results. Please try again.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [currentQuery, currentType]);
  
  // Function to generate mock search results - would be removed in production
  const generateMockResults = (query, type) => {
    if (!query) return [];
    
    const lowerQuery = query.toLowerCase();
    
    const athletes = [
      { id: 1, type: 'athlete', name: 'John Smith', position: 'FW', country: 'United States', image: `${process.env.PUBLIC_URL}/images/default-profile.png` },
      { id: 2, type: 'athlete', name: 'Maria Rodriguez', position: 'MF', country: 'Spain', image: `${process.env.PUBLIC_URL}/images/default-profile.png` },
      { id: 3, type: 'athlete', name: 'Ahmed Hassan', position: 'DF', country: 'Egypt', image: `${process.env.PUBLIC_URL}/images/default-profile.png` },
      { id: 4, type: 'athlete', name: 'Chen Wei', position: 'GK', country: 'China', image: `${process.env.PUBLIC_URL}/images/default-profile.png` }
    ];
    
    const teams = [
      { id: 101, type: 'team', name: 'FC Barcelona', league: 'La Liga', country: 'Spain', image: `${process.env.PUBLIC_URL}/images/default-team.png` },
      { id: 102, type: 'team', name: 'Manchester United', league: 'Premier League', country: 'England', image: `${process.env.PUBLIC_URL}/images/default-team.png` },
      { id: 103, type: 'team', name: 'Bayern Munich', league: 'Bundesliga', country: 'Germany', image: `${process.env.PUBLIC_URL}/images/default-team.png` },
      { id: 104, type: 'team', name: 'AC Milan', league: 'Serie A', country: 'Italy', image: `${process.env.PUBLIC_URL}/images/default-team.png` }
    ];
    
    let filteredResults = [];
    
    if (type === 'all' || type === 'athlete') {
      filteredResults = [
        ...filteredResults,
        ...athletes.filter(athlete => 
          athlete.name.toLowerCase().includes(lowerQuery) || 
          athlete.country.toLowerCase().includes(lowerQuery) ||
          athlete.position.toLowerCase().includes(lowerQuery)
        )
      ];
    }
    
    if (type === 'all' || type === 'team') {
      filteredResults = [
        ...filteredResults,
        ...teams.filter(team => 
          team.name.toLowerCase().includes(lowerQuery) || 
          team.country.toLowerCase().includes(lowerQuery) ||
          team.league.toLowerCase().includes(lowerQuery)
        )
      ];
    }
    
    return filteredResults;
  };
  
  return (
    <div className="search-page-layout">
      <Sidebar />
      <div className="search-page-main">
        <div className="search-header">
          <h1>Search</h1>
          <p className="search-subtitle">Find athletes, teams, and more</p>
        </div>
        
        <SearchFilters 
          currentQuery={currentQuery}
          currentType={currentType}
          onSearchChange={handleSearchChange}
          onTypeChange={handleTypeChange}
        />
        
        {isLoading ? (
          <div className="search-loading">
            <Loading size="large" message="Searching..." />
          </div>
        ) : error ? (
          <div className="search-error">
            <p>{error}</p>
          </div>
        ) : (
          <SearchResults 
            results={searchResults} 
            query={currentQuery}
            type={currentType}
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
