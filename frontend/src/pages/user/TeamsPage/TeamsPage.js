import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import PageLayout from '../../../components/layout/PageLayout';
import './TeamsPage.css';

const TeamsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock teams data
  const teams = [
    { id: 101, name: 'Phoenix Flames', league: 'Premier League', country: 'United States', members: 28, image: `${process.env.PUBLIC_URL}/images/default-team.png` },
    { id: 102, name: 'Royal Knights', league: 'Champion League', country: 'United Kingdom', members: 22, image: `${process.env.PUBLIC_URL}/images/default-team.png` },
    { id: 103, name: 'Thunder Strikers', league: 'Premier League', country: 'Germany', members: 25, image: `${process.env.PUBLIC_URL}/images/default-team.png` },
    { id: 104, name: 'Golden Eagles', league: 'Champion League', country: 'France', members: 24, image: `${process.env.PUBLIC_URL}/images/default-team.png` },
    { id: 105, name: 'Silver Wolves', league: 'Elite League', country: 'Italy', members: 26, image: `${process.env.PUBLIC_URL}/images/default-team.png` },
    { id: 106, name: 'Diamond Dragons', league: 'Elite League', country: 'Spain', members: 23, image: `${process.env.PUBLIC_URL}/images/default-team.png` },
  ];

  // Filter teams based on search query
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.league.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="teams-page-layout">
      <Sidebar />
      <PageLayout className="teams-page-content" maxWidth="1200px" withPadding={true}>
        <div className="teams-header">
          <h1>Teams</h1>
          <div className="teams-actions">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search teams..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            <button className="create-team-btn">Create Team</button>
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="no-teams">
            <p>No teams found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="teams-grid">
            {filteredTeams.map(team => (
              <Link to={`/teams/${team.id}`} className="team-card" key={team.id}>
                <div className="team-logo">
                  <img src={team.image} alt={team.name} />
                </div>
                <div className="team-info">
                  <h3 className="team-name">{team.name}</h3>
                  <div className="team-details">
                    <span className="team-league">{team.league}</span>
                    <span className="team-location">{team.country}</span>
                  </div>
                  <div className="team-members">
                    <span className="members-icon">👥</span>
                    <span className="members-count">{team.members} members</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PageLayout>
    </div>
  );
};

export default TeamsPage;
