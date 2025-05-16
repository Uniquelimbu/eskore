import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Overview.css';

const Overview = ({ team, members, isManager }) => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(team || null);
  const [teamMembers, setTeamMembers] = useState(members || []);
  const [loading, setLoading] = useState(!team);
  
  const handleBackClick = () => {
    // Direct navigation to team space instead of using browser history
    navigate(`/teams/${teamId}/space`);
  };
  
  useEffect(() => {
    // If team props are passed, use them
    if (team && members) {
      setTeamData(team);
      setTeamMembers(members);
      return;
    }
    
    // Otherwise fetch data for this specific team
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const [teamResponse, membersResponse] = await Promise.all([
          fetch(`/api/teams/${teamId}`),
          fetch(`/api/teams/${teamId}/members`)
        ]);
        
        if (!teamResponse.ok || !membersResponse.ok) {
          throw new Error('Failed to fetch team data');
        }
        
        const [teamData, membersData] = await Promise.all([
          teamResponse.json(),
          membersResponse.json()
        ]);
        
        setTeamData(teamData);
        setTeamMembers(membersData.members || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setLoading(false);
      }
    };
    
    fetchTeamData();
  }, [team, members, teamId]);
  
  if (loading) return <div>Loading team overview...</div>;
  if (!teamData) return <div>Team not found</div>;
  
  return (
    <div className="overview-container">
      <div className="back-button-container">
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
      </div>
      
      <div className="page-header">
        <h2>Team Overview</h2>
      </div>
      
      <div className="team-details">
        <div className="team-info-card">
          <h3>About {teamData.name}</h3>
          <p><strong>Founded:</strong> {teamData.foundedYear || 'N/A'}</p>
          <p><strong>Location:</strong> {teamData.city || 'N/A'}</p>
          <p><strong>Nickname:</strong> {teamData.nickname || 'N/A'}</p>
          {teamData.description && <p>{teamData.description}</p>}
        </div>
        
        <div className="team-stats-card">
          <h3>Team Stats</h3>
          <p><strong>Members:</strong> {teamMembers.length}</p>
          <p><strong>Win Rate:</strong> 75%</p> {/* This would be fetched from API */}
          <p><strong>Matches Played:</strong> 24</p> {/* This would be fetched from API */}
        </div>
      </div>
    </div>
  );
};

export default Overview;
