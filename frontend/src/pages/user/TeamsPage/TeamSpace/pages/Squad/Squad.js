import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../../../../../../services/apiClient';
import JoinTeamDialog from '../../../../../../components/dialogs/JoinTeamDialog';
import { useAuth } from '../../../../../../contexts/AuthContext';
import './Squad.css';

const Squad = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { isManager } = useOutletContext() || {}; // Get isManager from outlet context
  const { user } = useAuth();
  
  const [managers, setManagers] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('athlete');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [team, setTeam] = useState(null);
  
  console.log('Squad: Is user a manager?', isManager);
  
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamResponse = await apiClient.get(`/teams/${teamId}`);
        setTeam(teamResponse);
      } catch (err) {
        console.error('Error fetching team:', err);
        setError('Failed to load team information');
      }
    };
    
    fetchTeam();
  }, [teamId]);
  
  useEffect(() => {
    const fetchSquad = async () => {
      try {
        setLoading(true);
        // API calls should go here instead of mock data
        const membersResponse = await apiClient.get(`/teams/${teamId}/members`);
        console.log('Squad: Members fetched:', membersResponse);
        
        // Check if current user is a member
        if (membersResponse && membersResponse.members && Array.isArray(membersResponse.members)) {
          const userIsMember = membersResponse.members.some(
            member => member.userId === user.id || member.id === user.id
          );
          setIsMember(userIsMember);
          
          // Categorize members by role
          const managerMembers = membersResponse.members.filter(m => 
            m.role === 'manager' || m.role === 'assistant_manager');
          const athleteMembers = membersResponse.members.filter(m => 
            m.role === 'athlete');
          const coachMembers = membersResponse.members.filter(m => 
            m.role === 'coach');
          
          setManagers(managerMembers);
          setAthletes(athleteMembers);
          setCoaches(coachMembers);
          
          console.log(`Squad: Categorized ${managerMembers.length} managers, ${athleteMembers.length} athletes, ${coachMembers.length} coaches`);
        } else {
          // Temporary empty arrays if API response is invalid
          console.warn('Squad: Invalid members response format, using empty arrays');
          setManagers([]);
          setAthletes([]);
          setCoaches([]);
        }
      } catch (err) {
        console.error('Error fetching squad:', err);
        setError('Failed to load squad information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSquad();
  }, [teamId, user.id]);
  
  const handleAddMember = () => {
    setShowAddMemberForm(true);
  };
  
  const handleJoinTeamClick = () => {
    setShowJoinModal(true);
  };
  
  const handleJoinTeamSubmit = async (joinData) => {
    try {
      // First, join the team
      const joinResponse = await apiClient.post(`/teams/${teamId}/members`, {
        role: joinData.role
      });
      
      if (joinResponse && joinResponse.success) {
        // If player data was provided, create player profile
        if (joinData.playerData) {
          const playerResponse = await apiClient.post('/players', {
            ...joinData.playerData,
            teamId
          });
          
          if (!playerResponse || !playerResponse.success) {
            console.error('Player profile creation failed:', playerResponse);
            // Continue anyway as the team join was successful
          }
        }
        
        // Close the dialog and refresh the page
        setShowJoinModal(false);
        window.location.reload(); // Refresh to show updated UI
      } else {
        console.error('Team join failed:', joinResponse);
        setError('Failed to join team. Please try again.');
      }
    } catch (err) {
      console.error('Error joining team:', err);
      setError('Failed to join team: ' + (err.message || 'Unknown error'));
    }
  };
  
  const handleRemoveMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      // Remove logic
      console.log('Removing member:', memberId);
    }
  };

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    console.log('Adding new member:', { email: newMemberEmail, role: newMemberRole });
    // Add logic to send request to backend
    setNewMemberEmail('');
    setNewMemberRole('athlete');
    setShowAddMemberForm(false);
  };

  const handleBack = () => {
    navigate(`/teams/${teamId}/space`);
  };

  if (loading) {
    return <div className="squad-loading">Loading squad information...</div>;
  }
  
  if (error) {
    return <div className="squad-error">{error}</div>;
  }

  const teamHasMembers = managers.length > 0 || athletes.length > 0 || coaches.length > 0;

  return (
    <div className="squad-page">
      <div className="squad-header">
        <button className="back-button" onClick={handleBack}>
          &larr; Back
        </button>
        <h2>Squad</h2>
        <div className="squad-actions">
          {isManager && (
            <button className="add-member-btn" onClick={handleAddMember}>
              Add Member
            </button>
          )}
          {!isMember && !isManager && (
            <button className="join-team-btn" onClick={handleJoinTeamClick}>
              Join Team
            </button>
          )}
        </div>
      </div>
      
      {showAddMemberForm && (
        <div className="add-member-form">
          <h3>Add New Team Member</h3>
          <form onSubmit={handleAddMemberSubmit}>
            <div className="form-group">
              <label htmlFor="memberEmail">Email:</label>
              <input
                type="email"
                id="memberEmail"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="memberRole">Role:</label>
              <select
                id="memberRole"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
              >
                <option value="athlete">Athlete</option>
                <option value="coach">Coach</option>
                {isManager && <option value="assistant_manager">Assistant Manager</option>}
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowAddMemberForm(false)}>
                Cancel
              </button>
              <button type="submit" className="submit-btn">Add Member</button>
            </div>
          </form>
        </div>
      )}
      
      {showJoinModal && team && (
        <JoinTeamDialog
          team={team}
          onJoin={handleJoinTeamSubmit}
          onCancel={() => setShowJoinModal(false)}
        />
      )}
      
      <div className="squad-container">
        {managers.length > 0 && (
          <div className="squad-section">
            <h3>Managers</h3>
            <div className="squad-members">
              {managers.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">
                    <img src={member.avatar || member.Player?.profileImageUrl || '/images/default-avatar.png'} alt={`${member.firstName} ${member.lastName}`} />
                  </div>
                  <div className="member-info">
                    <h4>{member.firstName} {member.lastName}</h4>
                    <p className="member-role">{member.role}</p>
                    {member.Manager?.playingStyle && (
                      <p className="member-style">Style: {member.Manager.playingStyle}</p>
                    )}
                  </div>
                  {isManager && member.role !== 'manager' && (
                    <button 
                      className="remove-member-btn" 
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {athletes.length > 0 && (
          <div className="squad-section">
            <h3>Athletes</h3>
            <div className="squad-members">
              {athletes.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">
                    <img src={member.avatar || member.Player?.profileImageUrl || '/images/default-avatar.png'} alt={`${member.firstName} ${member.lastName}`} />
                  </div>
                  <div className="member-info">
                    <h4>{member.firstName} {member.lastName}</h4>
                    <p className="member-position">{member.Player?.position || 'No position'}</p>
                    {member.Player?.jerseyNumber && <p className="member-jersey">#{member.Player.jerseyNumber}</p>}
                    {member.Player?.nationality && <p className="member-nationality">{member.Player.nationality}</p>}
                  </div>
                  {isManager && (
                    <button 
                      className="remove-member-btn" 
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {coaches.length > 0 && (
          <div className="squad-section">
            <h3>Coaches</h3>
            <div className="squad-members">
              {coaches.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">
                    <img src={member.avatar || '/images/default-avatar.png'} alt={`${member.firstName} ${member.lastName}`} />
                  </div>
                  <div className="member-info">
                    <h4>{member.firstName} {member.lastName}</h4>
                    <p className="member-role">{member.role}</p>
                  </div>
                  {isManager && (
                    <button 
                      className="remove-member-btn" 
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!teamHasMembers && (
          <div className="empty-state">
            <p>This team has no members yet. Add members to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Squad;
