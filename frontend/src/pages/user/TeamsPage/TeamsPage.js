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
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/api/teams/user/${user.id}`);
        
        if (response && response.teams && response.teams.length > 0) {
          const firstTeam = response.teams[0];
          if (firstTeam && firstTeam.id) {
            navigate(`/teams/${firstTeam.id}/space/overview`);
            return;
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error checking user teams:', err);
        if (err.response) {
          const status = err.response.status;
          if (status === 404 || status === 401) {
            // user has no team or auth not ready – silent fallback
            setLoading(false);
          } else {
            // For server errors, log but don't block UX
            setLoading(false);
          }
        } else {
          // Network error; silent
          setLoading(false);
        }
      }
    };

    if (user && user.id) {
      checkUserTeam();
    } else {
      setLoading(false);
    }
  }, [user, user?.id, navigate]);

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
