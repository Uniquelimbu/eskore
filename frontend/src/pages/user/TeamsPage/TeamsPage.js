import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../services/apiClient';
import Sidebar from '../components/Sidebar/Sidebar';
import PageLayout from '../../../components/PageLayout/PageLayout';
import './TeamsPage.css';

const TeamsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.log(`TeamsPage: Fetching teams for user ID ${user.id}`);
        
        // The correct endpoint for getting a user's teams
        const response = await apiClient.get(`/api/teams/user/${user.id}`);
        console.log('TeamsPage: User teams API response:', response);
        
        if (response && response.teams && response.teams.length > 0) {
          const firstTeam = response.teams[0];
          
          if (firstTeam && firstTeam.id) {
            console.log(`TeamsPage: Found team ${firstTeam.id, saving to localStorage`);
            localStorage.setItem('lastTeamId', firstTeam.id.toString());
            
            console.log(`TeamsPage: Redirecting to team space: /teams/${firstTeam.id}/space/overview`);
            navigate(`/teams/${firstTeam.id}/space/overview`);
            return;
          } else {
            console.log('TeamsPage: Invalid team structure in response:', firstTeam);
          }
        } else {
          console.log('TeamsPage: No teams found for user');
          localStorage.removeItem('lastTeamId');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('TeamsPage: Error fetching user teams:', err);
        localStorage.removeItem('lastTeamId');
        
        if (err.response) {
          console.log('TeamsPage: Error response:', err.response.status, err.response.data);
        }
        
        setError('Could not load team data. Please try again.');
        setLoading(false);
      }
    };

    // First check localStorage for existing team
    const lastTeamId = localStorage.getItem('lastTeamId');
    
    if (lastTeamId && isAuthenticated) {
      console.log(`TeamsPage: Found lastTeamId in localStorage: ${lastTeamId}, validating...`);
      
      apiClient.get(`/api/teams/${lastTeamId}`)
        .then(response => {
          if (response && response.id) {
            console.log(`TeamsPage: Team ${lastTeamId} validated, navigating`);
            navigate(`/teams/${lastTeamId}/space/overview`);
          } else {
            console.log('TeamsPage: Team validation failed, checking user teams');
            checkUserTeam();
          }
        })
        .catch(err => {
          console.error(`TeamsPage: Error validating team ${lastTeamId}:`, err);
          console.log('TeamsPage: Falling back to user teams check');
          localStorage.removeItem('lastTeamId');
          checkUserTeam();
        });
    } else {
      console.log('TeamsPage: No lastTeamId in localStorage, checking user teams');
      checkUserTeam();
    }
    
    // Cleanup function
    return () => {
      console.log('TeamsPage: Component unmounting');
    };
  }, [user, isAuthenticated, navigate]);

  const handleOptionClick = (option) => {
    if (option === 'join') {
      navigate('/search?type=team');
    } else if (option === 'create') {
      navigate('/teams/create');
    }
  };

  if (loading) {
    return (
      <div className="teams-page-layout">
        <Sidebar />
        <PageLayout className="teams-page-content" maxWidth="1200px" withPadding={true}>
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Loading team information...</p>
          </div>
        </PageLayout>
      </div>
    );
  }

  return (
    <div className="teams-page-layout">
      <Sidebar />
      <PageLayout className="teams-page-content" maxWidth="1200px" withPadding={true}>
        <div className="teams-header">
          <h1>Team Management</h1>
          <p className="teams-subtitle">Join an existing team or create a new one</p>
        </div>
        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}
        
        <div className="team-options">
          <div className="team-option-card" onClick={() => handleOptionClick('join')}>
            <span className="option-icon">🤝</span>
            <h2>Join Team</h2>
            <p>Join an existing team to collaborate with other players and participate in tournaments together</p>
            <button className="option-button">Join Now</button>
          </div>
          
          <div className="team-option-card" onClick={() => handleOptionClick('create')}>
            <span className="option-icon">✨</span>
            <h2>Create Team</h2>
            <p>Start your own team, invite players, and build your reputation in the competitive scene</p>
            <button className="option-button">Create New</button>
          </div>
        </div>
      </PageLayout>
    </div>
  );
};

export default TeamsPage;
