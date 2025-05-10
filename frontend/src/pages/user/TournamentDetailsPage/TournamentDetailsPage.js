import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../../../components/layout/PageLayout';
import './TournamentDetailsPage.css';

const TournamentDetailsPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock tournament data
  const tournament = {
    id,
    name: 'Summer Championship 2023',
    image: `${process.env.PUBLIC_URL}/images/default-tournament.jpg`,
    startDate: '2023-07-15',
    endDate: '2023-07-30',
    status: 'upcoming',
    teams: 16,
    prize: '$5,000',
    location: 'Online',
    organizer: 'eSkore Tournament Series',
    description: 'Join the biggest summer tournament of 2023! This tournament features top teams from around the world competing for glory and prizes.',
    format: 'Double Elimination',
    rules: [
      'Standard competitive ruleset',
      'Matches are best of 3',
      'Finals are best of 5',
      'Players must be registered 48 hours before the tournament starts'
    ],
    participants: [
      { id: 101, name: 'Phoenix Flames', logo: `${process.env.PUBLIC_URL}/images/default-team.png`, confirmed: true },
      { id: 102, name: 'Royal Knights', logo: `${process.env.PUBLIC_URL}/images/default-team.png`, confirmed: true },
      { id: 103, name: 'Thunder Strikers', logo: `${process.env.PUBLIC_URL}/images/default-team.png`, confirmed: false },
      { id: 104, name: 'Golden Eagles', logo: `${process.env.PUBLIC_URL}/images/default-team.png`, confirmed: true },
      { id: 105, name: 'Silver Wolves', logo: `${process.env.PUBLIC_URL}/images/default-team.png`, confirmed: false },
      { id: 106, name: 'Diamond Dragons', logo: `${process.env.PUBLIC_URL}/images/default-team.png`, confirmed: true },
    ],
    matches: [
      { id: 201, round: 'Quarter Finals', team1: 'Phoenix Flames', team2: 'Royal Knights', date: '2023-07-16', time: '14:00', result: 'TBD' },
      { id: 202, round: 'Quarter Finals', team1: 'Golden Eagles', team2: 'Diamond Dragons', date: '2023-07-16', time: '16:00', result: 'TBD' },
      { id: 203, round: 'Quarter Finals', team1: 'Thunder Strikers', team2: 'Silver Wolves', date: '2023-07-16', time: '18:00', result: 'TBD' },
    ]
  };

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Function to get status label and class
  const getStatusInfo = (status) => {
    switch(status) {
      case 'upcoming':
        return { label: 'Upcoming', className: 'status-upcoming' };
      case 'ongoing':
        return { label: 'In Progress', className: 'status-ongoing' };
      case 'completed':
        return { label: 'Completed', className: 'status-completed' };
      default:
        return { label: status, className: '' };
    }
  };

  const statusInfo = getStatusInfo(tournament.status);

  return (
    <PageLayout className="tournament-details-page-content" maxWidth="1200px" withPadding={true}>
      <div className="tournament-banner" style={{ backgroundImage: `url(${tournament.image})` }}>
        <div className="tournament-banner-overlay">
          <div className="tournament-banner-content">
            <h1>{tournament.name}</h1>
            <div className="tournament-banner-meta">
              <span className="tournament-dates">
                <span className="meta-icon">📅</span>
                {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
              </span>
              <span className={`tournament-status ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="tournament-actions">
        <button className="register-btn">Register for Tournament</button>
        <button className="share-btn">Share</button>
      </div>

      <div className="tournament-tabs">
        <button 
          className={`tournament-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tournament-tab ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          Teams
        </button>
        <button 
          className={`tournament-tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
        <button 
          className={`tournament-tab ${activeTab === 'bracket' ? 'active' : ''}`}
          onClick={() => setActiveTab('bracket')}
        >
          Bracket
        </button>
        <button 
          className={`tournament-tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Rules
        </button>
      </div>

      <div className="tournament-content">
        {activeTab === 'overview' && (
          <div className="tournament-overview">
            <div className="tournament-info-card">
              <h3>Tournament Details</h3>
              <div className="tournament-info-grid">
                <div className="info-item">
                  <span className="info-label">Organizer</span>
                  <span className="info-value">{tournament.organizer}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Format</span>
                  <span className="info-value">{tournament.format}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Prize Pool</span>
                  <span className="info-value">{tournament.prize}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Teams</span>
                  <span className="info-value">{tournament.teams}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{tournament.location}</span>
                </div>
              </div>
            </div>
            
            <div className="tournament-description-card">
              <h3>About the Tournament</h3>
              <p>{tournament.description}</p>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="tournament-teams">
            <h3>Participating Teams</h3>
            <div className="teams-grid">
              {tournament.participants.map(team => (
                <div className="team-card" key={team.id}>
                  <div className="team-logo">
                    <img src={team.logo} alt={team.name} />
                  </div>
                  <div className="team-info">
                    <h4>{team.name}</h4>
                    <span className={`team-status ${team.confirmed ? 'confirmed' : 'pending'}`}>
                      {team.confirmed ? 'Confirmed' : 'Registration Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="tournament-schedule">
            <h3>Match Schedule</h3>
            <div className="schedule-list">
              {tournament.matches.map(match => (
                <div className="match-card" key={match.id}>
                  <div className="match-info">
                    <span className="match-round">{match.round}</span>
                    <div className="match-date-time">
                      <span className="match-date">{match.date}</span>
                      <span className="match-time">{match.time}</span>
                    </div>
                  </div>
                  <div className="match-teams">
                    <span className="match-team">{match.team1}</span>
                    <span className="match-vs">vs</span>
                    <span className="match-team">{match.team2}</span>
                  </div>
                  <div className="match-result">
                    {match.result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bracket' && (
          <div className="tournament-bracket">
            <h3>Tournament Bracket</h3>
            <div className="bracket-placeholder">
              <p>Bracket will be available once the tournament begins.</p>
              <div className="bracket-coming-soon">Coming Soon</div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="tournament-rules">
            <h3>Rules & Guidelines</h3>
            <div className="rules-content">
              <h4>Tournament Format</h4>
              <p>{tournament.format}</p>
              
              <h4>Rules</h4>
              <ul className="rules-list">
                {tournament.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default TournamentDetailsPage;
