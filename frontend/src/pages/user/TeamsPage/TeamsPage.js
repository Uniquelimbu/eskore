import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../services';
import PageLayout from '../../../components/layout/PageLayout';
import './TeamsPage.css';

// Team API timeout - make it much shorter to improve user experience
const TEAM_API_TIMEOUT = 5000; // 5 seconds instead of 15

const TeamsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    // Debug logging
    console.log('TeamsPage: Component mounted, auth state:', { user, isAuthenticated });
    
    const checkUserTeam = async () => {
      if (!isAuthenticated || !user || !user.id) {
        console.log('TeamsPage: No authenticated user, ending team check');
        setLoading(false);
        return;
      }

      try {
        // Skip cache and directly fetch teams from server for the most up-to-date data
        console.log('TeamsPage: Fetching teams for user', user.id);
        const response = await apiClient.get(`/teams/user/${user.id}`, { 
          timeout: TEAM_API_TIMEOUT 
        });
        
        if (response && response.teams && Array.isArray(response.teams)) {
          console.log('TeamsPage: Teams fetched successfully', response.teams);
          
          // Update state with the teams
          setTeams(response.teams);
          
          // If we have teams, navigate directly to the first team's space
          if (response.teams.length > 0) {
            const firstTeam = response.teams[0];
            if (firstTeam.id) {
              console.log(`TeamsPage: Navigating to team space for: ${firstTeam.id}`);
              // Navigate to the base team space URL
              navigate(`/teams/${firstTeam.id}/space`);
              return; // Important to return to avoid setting loading to false
            }
          }
        } else {
          console.warn('TeamsPage: No teams found or invalid response format', response);
        }
        
        // If we're still here, show the teams page
        setLoading(false);
      } catch (err) {
        console.error('TeamsPage: Error fetching teams', err);
        setError('Failed to load teams. Please try again.');
        setLoading(false);
      }
    };

    checkUserTeam();
  }, [user, isAuthenticated, navigate]);

  const handleOptionClick = (option) => {
    if (option === 'join') {
      navigate('/search?type=team');
    } else if (option === 'create') {
      navigate('/teams/create');
    }
  };

  const handleTeamClick = (teamId) => {
    // Navigate to the team's space dashboard
    navigate(`/teams/${teamId}/space`);
  };

  if (loading) {
    return (
      <PageLayout className="teams-page-content" maxWidth="1200px" withPadding={true}>
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading team information...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="teams-page-content" maxWidth="1200px" withPadding={true}>
      <div className="teams-header">
        <h1>Teams</h1>
        <p className="teams-subtitle">Join an existing team or create a new one</p>
      </div>
      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      {teams.length > 0 && (
        <div className="teams-list-section">
          <h2>Your Teams</h2>
          <div className="teams-grid">
            {teams.map(team => (
              <div 
                key={team.id}
                className="team-card"
                onClick={() => handleTeamClick(team.id)}
              >
                <div className="team-logo-container">
                  {team.logoUrl ? (
                    <img src={team.logoUrl} alt={`${team.name} logo`} className="team-logo" />
                  ) : (
                    <div className="team-logo-placeholder">
                      {team.abbreviation || team.name.substring(0, 3)}
                    </div>
                  )}
                </div>
                <h3>{team.name}</h3>
                {team.teamIdentifier && <div className="team-identifier">{team.teamIdentifier}</div>}
                <p className="team-role">{team.role || 'Member'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="team-options">
        <div className="team-option-card" onClick={() => handleOptionClick('join')}>
          <span className="option-icon-teams">🤝</span>
          <h2>Join Team</h2>
          <p>Join an existing team to collaborate with other players</p>
          <button className="option-button">Join Now</button>
        </div>
        
        <div className="team-option-card" onClick={() => handleOptionClick('create')}>
          <span className="option-icon-teams">✨</span>
          <h2>Create Team</h2>
          <p>Start your own team and invite players</p>
          <button className="option-button">Create New</button>
        </div>
      </div>
    </PageLayout>
  );
};

export default TeamsPage;
