import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Squad.css'; // Import the CSS file

const Squad = ({ team, members, isManager }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState(members || []);
  const [loading, setLoading] = useState(!members);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('athlete');
  const [submitStatus, setSubmitStatus] = useState(null);
  
  useEffect(() => {
    // If members props are passed, use them
    if (members) {
      setTeamMembers(members);
      return;
    }
    
    // Otherwise fetch members for this specific team
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teams/${teamId}/members`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch team members');
        }
        
        const data = await response.json();
        setTeamMembers(data.members || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team members:', error);
        setLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, [members, teamId]);
  
  const handleAddMember = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitStatus({ type: 'loading', message: 'Adding member...' });
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newMemberEmail,
          role: newMemberRole
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add member');
      }
      
      // Refresh the member list
      const membersResponse = await fetch(`/api/teams/${teamId}/members`);
      const membersData = await membersResponse.json();
      setTeamMembers(membersData.members || []);
      
      // Reset form
      setNewMemberEmail('');
      setNewMemberRole('athlete');
      setShowAddMemberForm(false);
      setSubmitStatus({ type: 'success', message: 'Member added successfully!' });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error adding member:', error);
      setSubmitStatus({ type: 'error', message: error.message });
    }
  };
  
  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove member');
      }
      
      // Update the member list without a full refresh
      setTeamMembers(teamMembers.filter(member => member.id !== userId));
      setSubmitStatus({ type: 'success', message: 'Member removed successfully!' });
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error removing member:', error);
      setSubmitStatus({ type: 'error', message: error.message });
    }
  };
  
  const handleBackClick = () => {
    // Navigate directly to the team space base route without any sub-path
    navigate(`/teams/${teamId}/space`);
  };
  
  if (loading) return <div>Loading squad information...</div>;
  
  // Filter members by role for better organization
  const managers = teamMembers.filter(m => m.role === 'manager' || m.role === 'assistant_manager');
  const athletes = teamMembers.filter(m => m.role === 'athlete');
  const coaches = teamMembers.filter(m => m.role === 'coach');
  
  return (
    <div className="team-page squad-page">
      <div className="back-button-container">
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>
      
      <div className="page-header">
        <h2>Team Squad</h2>
      </div>
      
      {submitStatus && (
        <div className={`status-message ${submitStatus.type}`}>
          {submitStatus.message}
        </div>
      )}
      
      {showAddMemberForm && (
        <form onSubmit={handleAddMember} className="add-member-form">
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
          <button type="submit" className="submit-btn">Add Member</button>
        </form>
      )}
      
      <div className="squad-container">
        {managers.length > 0 && (
          <div className="squad-section">
            <h3>Management</h3>
            <div className="squad-members">
              {managers.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">
                    <img src={member.avatar || '/images/default-avatar.png'} alt={`${member.firstName} {member.lastName}`} />
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
                    <img src={member.avatar || '/images/default-avatar.png'} alt={`${member.firstName} {member.lastName}`} />
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
                    <img src={member.avatar || '/images/default-avatar.png'} alt={`${member.firstName} {member.lastName}`} />
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
        
        {teamMembers.length === 0 && (
          <div className="empty-state">
            <p>This team has no members yet. Add members to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Squad;
