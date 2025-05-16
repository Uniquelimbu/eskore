import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import apiClient from '../../../../../../services/apiClient';
import './Squad.css';

const Squad = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { isManager } = useOutletContext() || {}; // Get isManager from outlet context
  
  const [managers, setManagers] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('athlete');
  
  console.log('Squad: Is user a manager?', isManager);
  
  useEffect(() => {
    const fetchSquad = async () => {
      try {
        setLoading(true);
        // API calls should go here instead of mock data
        const membersResponse = await apiClient.get(`/api/teams/${teamId}/members`);
        console.log('Squad: Members fetched:', membersResponse);
        
        if (membersResponse && membersResponse.members && Array.isArray(membersResponse.members)) {
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
  }, [teamId]);
  
  const handleAddMember = () => {
    setShowAddMemberForm(true);
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
          &larr; Back to Team Space
        </button>
        <h2>Squad</h2>
        {isManager && (
          <button className="add-member-btn" onClick={handleAddMember}>
            Add Member
          </button>
        )}
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
      
      <div className="squad-container">
        {managers.length > 0 && (
          <div className="squad-section">
            <h3>Managers</h3>
            <div className="squad-members">
              {managers.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">
                    <img src={member.avatar || '/images/default-avatar.png'} alt={`${member.firstName} ${member.lastName}`} />
                  </div>
                  <div className="member-info">
                    <h4>{member.firstName} {member.lastName}</h4>
                    <p className="member-role">{member.role}</p>
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
                    <img src={member.avatar || '/images/default-avatar.png'} alt={`${member.firstName} ${member.lastName}`} />
                  </div>
                  <div className="member-info">
                    <h4>{member.firstName} {member.lastName}</h4>
                    <p className="member-position">{member.position || 'No position'}</p>
                    {member.jerseyNumber && <p className="member-jersey">#{member.jerseyNumber}</p>}
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
