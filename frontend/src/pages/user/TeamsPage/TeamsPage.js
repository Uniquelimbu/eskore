import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../services/apiClient';
import Sidebar from '../components/Sidebar/Sidebar';
import PageLayout from '../../../components/PageLayout/PageLayout';
import './TeamsPage.css';

const TeamsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserTeam = async () => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        // Call the API to get user teams
        const response = await apiClient.get(`/api/teams/user/${user.id}`);
        
        // Debug the response data structure
        console.log('User teams response:', response);
        
        // Check if response has teams array and has at least one team
        if (response && response.teams && response.teams.length > 0) {
          const firstTeam = response.teams[0];
          
          if (firstTeam && firstTeam.id) {
            // Save the redirect target to localStorage to ensure consistent behavior
            localStorage.setItem('lastTeamId', firstTeam.id);
            
            console.log(`Redirecting to team space: /teams/${firstTeam.id}/space/overview`);
            navigate(`/teams/${firstTeam.id}/space/overview`);
            return;
          }
        } else {
          // No teams found - ensure we clear any previously saved team ID
          localStorage.removeItem('lastTeamId');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error checking user teams:', err);
        
        // Clear localStorage on error to prevent redirect loops
        localStorage.removeItem('lastTeamId');
        
        if (err.response) {
          const status = err.response.status;
          if (status === 404 || status === 401) {
            // user has no team or auth not ready – silent fallback
            setLoading(false);
          } else {
            // For server errors, log but don't block UX
            setError('Could not load team data. Please try again later.');
            setLoading(false);
          }
        } else {
          // Network error; silent
          setLoading(false);
        }
      }
    };

    // Try to navigate to the last team if available
    const lastTeamId = localStorage.getItem('lastTeamId');
    if (lastTeamId && user && user.id) {
      console.log(`Found lastTeamId in storage: ${lastTeamId}, checking if still valid...`);
      apiClient.get(`/api/teams/${lastTeamId}`)
        .then(response => {
          if (response) {
            console.log(`Team ${lastTeamId} still exists, navigating to team space`);
            navigate(`/teams/${lastTeamId}/space/overview`);
          } else {
            // Team no longer exists or user no longer has access
            localStorage.removeItem('lastTeamId');
            checkUserTeam();
          }
        })
        .catch(err => {
          console.error('Error checking last team:', err);
          localStorage.removeItem('lastTeamId');
          checkUserTeam();
        });
    } else {
      checkUserTeam();
    }
  }, [user, navigate]);

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
