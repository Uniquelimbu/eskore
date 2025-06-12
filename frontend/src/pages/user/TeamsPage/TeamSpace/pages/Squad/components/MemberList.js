import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../../../../../services';
import MemberCard from './MemberCard';
import '../styles/MemberList.css';

const MemberList = ({ members, team, isManager, onMemberUpdate }) => {
  const [joinRequests, setJoinRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const navigate = useNavigate();
  const { teamId } = useParams();

  // Fetch join requests for managers
  useEffect(() => {
    const fetchJoinRequests = async () => {
      if (!isManager || !teamId) return;
      
      setRequestsLoading(true);
      try {
        const response = await apiClient.getTeamJoinRequests(teamId);
        setJoinRequests(response?.requests || []);
      } catch (error) {
        console.error('Error fetching join requests:', error);
        setJoinRequests([]);
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchJoinRequests();

    // Listen for membership changes
    const handleMembershipChanged = () => {
      fetchJoinRequests();
      if (onMemberUpdate) {
        onMemberUpdate();
      }
    };

    window.addEventListener('teamMembershipChanged', handleMembershipChanged);
    
    return () => {
      window.removeEventListener('teamMembershipChanged', handleMembershipChanged);
    };
  }, [isManager, teamId, onMemberUpdate]);

  const handleRequestsClick = () => {
    navigate(`/teams/${teamId}/requests`);
  };

  return (
    <div className="member-list-container">
      {/* Add requests section for managers */}
      {isManager && (
        <div className="requests-section">
          <div className="requests-header">
            
            <button 
              className="requests-button" 
              onClick={handleRequestsClick}
              disabled={requestsLoading}
            >
              Requests
              {joinRequests.length > 0 && (
                <span className="requests-badge">{joinRequests.length}</span>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="squad-section">
        <div className="members-grid">
          {members.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              team={team}
              isManager={isManager}
              onMemberUpdate={onMemberUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberList;
