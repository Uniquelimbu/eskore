import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import PageLayout from '../../../components/layout/PageLayout';
import './TournamentPage.css';

const TournamentPage = () => {
  const [filter, setFilter] = useState('all');
  
  // Mock tournaments data
  const tournaments = [
    { 
      id: 301, 
      name: 'Summer Championship 2023', 
      startDate: '2023-07-15', 
      endDate: '2023-07-30', 
      status: 'upcoming', 
      teams: 16, 
      prize: '$5,000',
      image: `${process.env.PUBLIC_URL}/images/default-tournament.jpg` 
    },
    { 
      id: 302, 
      name: 'Spring Cup 2023', 
      startDate: '2023-04-10', 
      endDate: '2023-04-25', 
      status: 'completed', 
      teams: 12, 
      prize: '$3,000',
      image: `${process.env.PUBLIC_URL}/images/default-tournament.jpg` 
    },
    { 
      id: 303, 
      name: 'Regional Qualifiers', 
      startDate: '2023-06-01', 
      endDate: '2023-06-10', 
      status: 'ongoing', 
      teams: 8, 
      prize: '$2,000',
      image: `${process.env.PUBLIC_URL}/images/default-tournament.jpg` 
    },
    { 
      id: 304, 
      name: 'Winter Championship 2022', 
      startDate: '2022-12-10', 
      endDate: '2022-12-20', 
      status: 'completed', 
      teams: 16, 
      prize: '$4,500',
      image: `${process.env.PUBLIC_URL}/images/default-tournament.jpg` 
    },
    { 
      id: 305, 
      name: 'Fall Tournament 2023', 
      startDate: '2023-09-15', 
      endDate: '2023-09-30', 
      status: 'upcoming', 
      teams: 24, 
      prize: '$6,000',
      image: `${process.env.PUBLIC_URL}/images/default-tournament.jpg` 
    }
  ];

  // Filter tournaments based on selected filter
  const filteredTournaments = filter === 'all' 
    ? tournaments 
    : tournaments.filter(tournament => tournament.status === filter);

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

  // Function to format date range
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <div className="tournament-page-layout">
      <Sidebar />
      <PageLayout className="tournament-page-content" maxWidth="1200px" withPadding={true}>
        <div className="tournament-header">
          <h1>Tournaments</h1>
          <div className="tournament-actions">
            <div className="tournament-filters">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`filter-btn ${filter === 'ongoing' ? 'active' : ''}`}
                onClick={() => setFilter('ongoing')}
              >
                In Progress
              </button>
              <button 
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
            <button className="create-tournament-btn">Create Tournament</button>
          </div>
        </div>

        {filteredTournaments.length === 0 ? (
          <div className="no-tournaments">
            <p>No tournaments found matching the selected filter.</p>
          </div>
        ) : (
          <div className="tournaments-grid">
            {filteredTournaments.map(tournament => {
              const statusInfo = getStatusInfo(tournament.status);
              return (
                <Link to={`/tournaments/${tournament.id}`} className="tournament-card" key={tournament.id}>
                  <div className="tournament-image" style={{ backgroundImage: `url(${tournament.image})` }}>
                    <div className={`tournament-status ${statusInfo.className}`}>
                      {statusInfo.label}
                    </div>
                  </div>
                  <div className="tournament-info">
                    <h3 className="tournament-name">{tournament.name}</h3>
                    <div className="tournament-dates">
                      <span className="dates-icon">📅</span>
                      <span className="dates-range">{formatDateRange(tournament.startDate, tournament.endDate)}</span>
                    </div>
                    <div className="tournament-details">
                      <div className="tournament-teams">
                        <span className="teams-icon">👥</span>
                        <span className="teams-count">{tournament.teams} Teams</span>
                      </div>
                      <div className="tournament-prize">
                        <span className="prize-icon">💰</span>
                        <span className="prize-amount">{tournament.prize}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PageLayout>
    </div>
  );
};

export default TournamentPage;
