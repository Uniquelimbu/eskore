import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import PageLayout from '../../../components/layout/PageLayout';
import './TeamDetailsPage.css';

const TeamDetailsPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock team data
  const team = {
    id: id,
    name: 'Phoenix Flames',
    logo: `${process.env.PUBLIC_URL}/images/default-team.png`,
    founded: '2018',
    league: 'Premier League',
    country: 'United States',
    achievements: [
      { id: 1, title: 'Champion', tournament: 'Summer Cup', year: '2022' },
      { id: 2, title: 'Runner-up', tournament: 'Winter Tournament', year: '2021' }
    ],
    members: [
      { id: 101, name: 'John Smith', position: 'Captain', avatar: `${process.env.PUBLIC_URL}/images/default-profile.png` },
      { id: 102, name: 'Emily Johnson', position: 'Vice-Captain', avatar: `${process.env.PUBLIC_URL}/images/default-profile.png` },
      { id: 103, name: 'Michael Brown', position: 'Forward', avatar: `${process.env.PUBLIC_URL}/images/default-profile.png` },
      { id: 104, name: 'David Wilson', position: 'Midfielder', avatar: `${process.env.PUBLIC_URL}/images/default-profile.png` },
      { id: 105, name: 'Sarah Davis', position: 'Defender', avatar: `${process.env.PUBLIC_URL}/images/default-profile.png` }
    ],
    matches: [
      { id: 201, date: '2023-06-15', opponent: 'Royal Knights', result: 'Win', score: '3-1' },
      { id: 202, date: '2023-06-05', opponent: 'Silver Wolves', result: 'Loss', score: '1-2' },
      { id: 203, date: '2023-05-28', opponent: 'Golden Eagles', result: 'Win', score: '2-0' }
    ]
  };

  return (
    <div className="team-details-page-layout">
      <Sidebar />
      <PageLayout className="team-details-page-content" maxWidth="1200px" withPadding={true}>
        <div className="team-header">
          <div className="team-header-content">
            <img src={team.logo} alt={team.name} className="team-logo" />
            <div className="team-header-info">
              <h1>{team.name}</h1>
              <div className="team-header-meta">
                <span>{team.league}</span>
                <span>{team.country}</span>
                <span>Founded: {team.founded}</span>
              </div>
            </div>
          </div>
          <div className="team-actions">
            <button className="join-team-btn">Join Team</button>
          </div>
        </div>

        <div className="team-tabs">
          <button 
            className={`team-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`team-tab ${activeTab === 'roster' ? 'active' : ''}`}
            onClick={() => setActiveTab('roster')}
          >
            Roster
          </button>
          <button 
            className={`team-tab ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            Matches
          </button>
          <button 
            className={`team-tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
        </div>

        <div className="team-content">
          {activeTab === 'overview' && (
            <div className="team-overview">
              <div className="team-stats-card">
                <h3>Team Statistics</h3>
                <div className="team-stats-grid">
                  <div className="team-stat">
                    <span className="stat-value">75%</span>
                    <span className="stat-label">Win Rate</span>
                  </div>
                  <div className="team-stat">
                    <span className="stat-value">42</span>
                    <span className="stat-label">Total Matches</span>
                  </div>
                  <div className="team-stat">
                    <span className="stat-value">5</span>
                    <span className="stat-label">Trophies</span>
                  </div>
                  <div className="team-stat">
                    <span className="stat-value">12</span>
                    <span className="stat-label">Players</span>
                  </div>
                </div>
              </div>
              
              <div className="team-description-card">
                <h3>About the Team</h3>
                <p>
                  The Phoenix Flames was established in 2018 with a mission to compete at the highest level of competitive gaming. 
                  Our team is dedicated to excellence, teamwork, and continuous improvement. 
                  We focus on developing talent and creating a supportive environment for our players.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'roster' && (
            <div className="team-roster">
              <h3>Team Members</h3>
              <div className="roster-grid">
                {team.members.map(member => (
                  <div className="roster-card" key={member.id}>
                    <img src={member.avatar} alt={member.name} className="member-avatar" />
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <span className="member-position">{member.position}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="team-matches">
              <h3>Recent Matches</h3>
              <div className="matches-list">
                {team.matches.map(match => (
                  <div className={`match-card ${match.result.toLowerCase()}`} key={match.id}>
                    <div className="match-date">
                      {new Date(match.date).toLocaleDateString()}
                    </div>
                    <div className="match-teams">
                      <span className="team-name">{team.name}</span>
                      <span className="match-score">{match.score}</span>
                      <span className="opponent-name">{match.opponent}</span>
                    </div>
                    <div className={`match-result ${match.result.toLowerCase()}`}>
                      {match.result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="team-achievements">
              <h3>Team Achievements</h3>
              <div className="achievements-list">
                {team.achievements.map(achievement => (
                  <div className="achievement-card" key={achievement.id}>
                    <div className="achievement-icon">🏆</div>
                    <div className="achievement-info">
                      <h4>{achievement.title}</h4>
                      <span>{achievement.tournament}, {achievement.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </div>
  );
};

export default TeamDetailsPage;
