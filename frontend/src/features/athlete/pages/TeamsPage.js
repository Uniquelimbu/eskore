import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { AthletePageLayout } from '../components/PageLayout';
import './TeamsPage.css';

function TeamsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'FC United',
      logo: null,
      role: 'First Team',
      status: 'active',
      joined: '2022-03-15',
      coach: 'James Wilson',
      nextMatch: { date: '2023-06-15', opponent: 'City FC', location: 'Home Stadium' }
    },
    {
      id: 2,
      name: 'National Team U21',
      logo: null,
      role: 'Squad Player',
      status: 'active',
      joined: '2022-09-10',
      coach: 'Robert Brown',
      nextMatch: { date: '2023-07-02', opponent: 'Regional Select', location: 'National Stadium' }
    }
  ]);
  const [invitations, setInvitations] = useState([
    {
      id: 101,
      teamName: 'City Academy',
      invitedBy: 'Sarah Johnson',
      date: '2023-05-28',
      role: 'Youth Team'
    }
  ]);

  // Fetch teams data
  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        // In a real app, this would be an API call to fetch teams
        setTimeout(() => {
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching teams:', error);
        setLoading(false);
      }
    };

    fetchTeamsData();
  }, [user]);

  // Handle invitation response
  const handleInvitation = (invitationId, accept) => {
    // In a real app, you would call an API endpoint to accept/reject
    console.log(`Invitation ${invitationId} ${accept ? 'accepted' : 'rejected'}`);
    
    // Remove the invitation from the list
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    
    if (accept) {
      // Add the team (this would come from API response in a real app)
      const acceptedInvite = invitations.find(inv => inv.id === invitationId);
      if (acceptedInvite) {
        const newTeam = {
          id: Date.now(), // placeholder for real ID
          name: acceptedInvite.teamName,
          logo: null,
          role: acceptedInvite.role,
          status: 'pending',
          joined: new Date().toISOString().split('T')[0],
          coach: 'TBD',
          nextMatch: null
        };
        setTeams(prev => [...prev, newTeam]);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AthletePageLayout
      title="My Teams"
      description="Manage your team memberships and invitations"
    >
      <div className="athlete-teams-page">
        <h1 className="page-title">My Teams</h1>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading team information...</p>
          </div>
        ) : (
          <>
            {/* Team Invitations */}
            {invitations.length > 0 && (
              <div className="invitations-section">
                <h2 className="section-title">Team Invitations</h2>
                <div className="invitations-list">
                  {invitations.map(invitation => (
                    <div className="invitation-card" key={invitation.id}>
                      <div className="invitation-info">
                        <div className="invitation-team">{invitation.teamName}</div>
                        <div className="invitation-details">
                          <span>Invited by {invitation.invitedBy}</span>
                          <span className="invitation-date">{formatDate(invitation.date)}</span>
                        </div>
                        <div className="invitation-role">Role: {invitation.role}</div>
                      </div>
                      <div className="invitation-actions">
                        <button 
                          className="btn-accept" 
                          onClick={() => handleInvitation(invitation.id, true)}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn-reject" 
                          onClick={() => handleInvitation(invitation.id, false)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Current Teams */}
            <div className="teams-section">
              <h2 className="section-title">Current Teams</h2>
              {teams.length === 0 ? (
                <div className="empty-state">
                  <p>You are not currently a member of any team.</p>
                  <button className="btn-primary">Find Teams to Join</button>
                </div>
              ) : (
                <div className="teams-grid">
                  {teams.map(team => (
                    <div className="team-card" key={team.id}>
                      <div className="team-header">
                        <div className="team-logo-container">
                          {team.logo ? (
                            <img src={team.logo} alt={`${team.name} logo`} className="team-logo" />
                          ) : (
                            <div className="team-logo-placeholder">
                              {team.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="team-header-info">
                          <h3 className="team-name">{team.name}</h3>
                          <span className={`status-badge ${team.status}`}>{team.status}</span>
                        </div>
                      </div>
                      
                      <div className="team-details">
                        <div className="team-detail">
                          <span className="detail-label">Your Role</span>
                          <span className="detail-value">{team.role}</span>
                        </div>
                        <div className="team-detail">
                          <span className="detail-label">Joined</span>
                          <span className="detail-value">{formatDate(team.joined)}</span>
                        </div>
                        <div className="team-detail">
                          <span className="detail-label">Coach</span>
                          <span className="detail-value">{team.coach}</span>
                        </div>
                      </div>
                      
                      {team.nextMatch && (
                        <div className="team-next-match">
                          <h4>Next Match</h4>
                          <div className="next-match-details">
                            <div className="match-date">{formatDate(team.nextMatch.date)}</div>
                            <div className="match-opponent">vs {team.nextMatch.opponent}</div>
                            <div className="match-location">{team.nextMatch.location}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="team-actions">
                        <button className="btn-team-action">View Team Page</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Find Teams */}
            <div className="find-teams-section">
              <h2 className="section-title">Find Teams</h2>
              <p>Looking for new teams to join? Explore teams in your area.</p>
              <button className="btn-primary">Explore Teams</button>
            </div>
          </>
        )}
      </div>
    </AthletePageLayout>
  );
}

export default TeamsPage;
