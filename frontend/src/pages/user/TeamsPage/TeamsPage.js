import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import PageLayout from '../../../components/layout/PageLayout';
import apiClient from '../../../services/apiClient';
import { useAuth } from '../../../contexts/AuthContext';
import './TeamsPage.css';

const TeamsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserTeam = async () => {
      try {
        setLoading(true);
        // Get all teams for the current user
        const response = await apiClient.get(`/api/teams/user/${user.id}`);
        
        if (response && response.teams && response.teams.length > 0) {
          // Redirect to the first team the user is a member of (any role)
          const firstTeam = response.teams[0];
          if (firstTeam) {
            navigate(`/teams/${firstTeam.id}/space/overview`);
            return;
          }
        }
        
        // If we get here, the user is not in any team
        setLoading(false);
      } catch (error) {
        console.error('Error checking user teams:', error);
        setError('Failed to load team information');
        setLoading(false);
      }
    };

    if (user && user.id) {
      checkUserTeam();
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleOptionClick = (option) => {
    if (option === 'join') {
      // Navigate to search page with team filter applied
      navigate('/search?type=team');
    } else if (option === 'create') {
      // Navigate to the Create Team page
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

  if (error) {
    return (
      <div className="teams-page-layout">
        <Sidebar />
        <PageLayout className="teams-page-content" maxWidth="1200px" withPadding={true}>
          <div className="error-message">
            {error}
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
