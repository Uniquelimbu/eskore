import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import PageLayout from '../../../components/layout/PageLayout';
import './TeamsPage.css';

const TeamsPage = () => {
  const navigate = useNavigate();

  const handleOptionClick = (option) => {
    if (option === 'join') {
      // Navigate to search page with team filter applied
      navigate('/search?type=team');
    } else if (option === 'create') {
      // Navigate to the Create Team page
      navigate('/teams/create');
    }
  };

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
