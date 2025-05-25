import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchFilters from './components/SearchFilters';
import SearchResults from './components/SearchResults';
import Loading from '../../../components/ui/Loading/Loading';
import PageLayout from '../../../components/PageLayout/PageLayout';
import './SearchPage.css';
import apiClient from '../../../services/apiClient';

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
  
  // keep a ref to abort previous axios or fetch request
  const abortRef = useRef(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!currentQuery.trim()) {
        setSearchResults([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // cancel previous in-flight request if any
        if (abortRef.current) {
          abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;
        let combinedResults = [];
        
        // If teams are part of the requested type, query backend search API
        if (currentType === 'all' || currentType === 'team') {
          try {
            // Use a different endpoint to avoid route conflict with /teams/:id
            const res = await apiClient.get(`/teams-search`, {
              params: {
                q: currentQuery.trim(),
                _t: Date.now() // Cache busting
              },
              signal: controller.signal 
            });
            
            if (res && res.teams) {
              const mappedTeams = res.teams.map(t => ({
                id: t.id,
                type: 'team',
                name: t.name,
                league: t.league || '', // placeholder if property exists later
                country: t.city || '',
                teamIdentifier: t.teamIdentifier || '', // Add team identifier
                image: t.logoUrl || `${process.env.PUBLIC_URL}/images/default-team.png`
              }));
              combinedResults.push(...mappedTeams);
            }
          } catch (teamErr) {
            console.error('Error searching teams:', teamErr);
            // Continue with other search types even if team search fails
          }
        }

        // Athletes are still mocked until athlete search endpoint is ready
        if (currentType === 'all' || currentType === 'athlete') {
          combinedResults.push(...generateMockAthleteResults(currentQuery));
        }

        setSearchResults(combinedResults);
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to fetch search results. Please try again.');
        setSearchResults([]);
      } finally {
        abortRef.current = null;
        setIsLoading(false);
      }
    };
    
    fetchSearchResults();
    // cleanup on param change/unmount
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [currentQuery, currentType]);
  
  // Mock athlete generator kept for now
  const generateMockAthleteResults = (query) => {
    if (!query) return [];
    const lower = query.toLowerCase();
    const athletes = [
      { id: 1, type: 'athlete', name: 'John Smith', position: 'FW', country: 'United States', image: `${process.env.PUBLIC_URL}/images/default-profile.png` },
      { id: 2, type: 'athlete', name: 'Maria Rodriguez', position: 'MF', country: 'Spain', image: `${process.env.PUBLIC_URL}/images/default-profile.png` },
      { id: 3, type: 'athlete', name: 'Ahmed Hassan', position: 'DF', country: 'Egypt', image: `${process.env.PUBLIC_URL}/images/default-profile.png` },
      { id: 4, type: 'athlete', name: 'Chen Wei', position: 'GK', country: 'China', image: `${process.env.PUBLIC_URL}/images/default-profile.png` }
    ];
    return athletes.filter(a => a.name.toLowerCase().includes(lower) || a.country.toLowerCase().includes(lower));
  };
  
  return (
    <PageLayout className="search-page-main">
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
    </PageLayout>
  );
};

export default SearchPage;
