import React, { useState, useEffect } from 'react';
import { useParams, NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar/Sidebar';
import PageLayout from '../../../components/layout/PageLayout';
import { useAuth } from '../../../contexts/AuthContext';
import Overview from './tabs/Overview';
import Squad from './tabs/Squad';
import Formation from './tabs/Formation';
import Calendar from './tabs/Calendar';
import Chat from './tabs/Chat';
import './TeamSpace.css';

const TeamSpace = () => {
  const { teamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/teams/${teamId}`, {
          withCredentials: true
        });
        
        setTeam(response.data);
        
        // Determine user's role in the team
        const userMembership = response.data.Users?.find(u => u.id === user.id);
        setUserRole(userMembership?.UserTeam?.role || null);
        
        // Get all team members
        const membersResponse = await axios.get(`/api/teams/${teamId}/members`, {
          withCredentials: true
        });
        
        setMembers(membersResponse.data.members || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId, user.id]);
  
  const isManager = userRole === 'owner' || userRole === 'manager';
  
  // Function to invite new members
  const handleInviteMember = () => {
    // Open invitation modal
    // This would be implemented as a modal component
    navigate(`/teams/${teamId}/invite`);
  };
  
  if (loading) {
    return (
      <div className="team-space-layout">
        <Sidebar />
        <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Loading team information...</p>
          </div>
        </PageLayout>
      </div>
    );
  }
  
  if (error || !team) {
    return (
      <div className="team-space-layout">
        <Sidebar />
        <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
          <div className="error-message">
            {error || 'Team not found'}
          </div>
        </PageLayout>
      </div>
    );
  }
  
  return (
    <div className="team-space-layout">
      <Sidebar />
      <PageLayout className="team-space-content" maxWidth="1200px" withPadding={true}>
        <div className="team-space-header">
          <div className="team-identity-section">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={`${team.name} logo`} className="team-logo" />
            ) : (
              <div className="team-logo-placeholder">
                {team.abbreviation || team.name.substring(0, 3)}
              </div>
            )}
            <div className="team-details">
              <h1>
                {team.name} 
                {team.abbreviation && <span className="team-abbreviation">[{team.abbreviation}]</span>}
              </h1>
              {team.nickname && <p className="team-nickname">{team.nickname}</p>}
              <p className="team-founded">Est. {team.foundedYear || new Date().getFullYear()}</p>
              <div className="team-meta">
                <span className="team-city">{team.city}</span>
                <span className="team-privacy">Private Team</span>
              </div>
            </div>
          </div>

          <div className="team-quick-stats">
            <div className="stat-item">
              <span className="stat-value">0-0-0</span>
              <span className="stat-label">Record (W-L-D)</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">None</span>
              <span className="stat-label">Next Match</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{members.length}</span>
              <span className="stat-label">Members</span>
            </div>
          </div>

          <div className="team-actions">
            {isManager && (
              <>
                <button className="action-button primary" onClick={handleInviteMember}>
                  <i className="fas fa-user-plus"></i> Invite Players
                </button>
                <button className="action-button secondary">
                  <i className="fas fa-cog"></i> Team Settings
                </button>
              </>
            )}
            <div className="notification-bell">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">0</span>
            </div>
          </div>
        </div>
        
        <div className="team-tabs">
          <NavLink 
            to={`/teams/${teamId}/space/overview`} 
            className={({isActive}) => isActive ? 'tab-link active' : 'tab-link'}
          >
            Overview
          </NavLink>
          <NavLink 
            to={`/teams/${teamId}/space/squad`} 
            className={({isActive}) => isActive ? 'tab-link active' : 'tab-link'}
          >
            Squad
          </NavLink>
          <NavLink 
            to={`/teams/${teamId}/space/formation`} 
            className={({isActive}) => isActive ? 'tab-link active' : 'tab-link'}
          >
            Formation
          </NavLink>
          <NavLink 
            to={`/teams/${teamId}/space/calendar`} 
            className={({isActive}) => isActive ? 'tab-link active' : 'tab-link'}
          >
            Calendar
          </NavLink>
          <NavLink 
            to={`/teams/${teamId}/space/chat`} 
            className={({isActive}) => isActive ? 'tab-link active' : 'tab-link'}
          >
            Chat
          </NavLink>
        </div>
        
        <div className="team-space-tab-content">
          <Routes>
            <Route path="overview" element={<Overview team={team} members={members} isManager={isManager} />} />
            <Route path="squad" element={<Squad team={team} members={members} isManager={isManager} />} />
            <Route path="formation" element={<Formation team={team} members={members} isManager={isManager} />} />
            <Route path="calendar" element={<Calendar team={team} members={members} isManager={isManager} />} />
            <Route path="chat" element={<Chat team={team} members={members} isManager={isManager} />} />
            <Route path="/" element={<Navigate to={`/teams/${teamId}/space/overview`} replace />} />
          </Routes>
        </div>
      </PageLayout>
    </div>
  );
};

export default TeamSpace;
