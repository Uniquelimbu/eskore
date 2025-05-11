import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../tabs/TabComponents.css';

const Formation = ({ team, members, isManager }) => {
  const { teamId } = useParams();
  const [formationTemplate, setFormationTemplate] = useState('4-4-2');
  const [teamMembers, setTeamMembers] = useState(members || []);
  const [positions, setPositions] = useState({});
  const [loading, setLoading] = useState(!members);
  
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
  
  // Load saved formation
  useEffect(() => {
    const savedFormation = localStorage.getItem(`team_${teamId}_formation`);
    if (savedFormation) {
      try {
        const formationData = JSON.parse(savedFormation);
        setFormationTemplate(formationData.template || '4-4-2');
        setPositions(formationData.positions || {});
      } catch (error) {
        console.error('Error parsing saved formation:', error);
      }
    }
  }, [teamId]);
  
  // Save formation when it changes
  useEffect(() => {
    if (teamId) {
      localStorage.setItem(`team_${teamId}_formation`, JSON.stringify({
        template: formationTemplate,
        positions
      }));
    }
  }, [formationTemplate, positions, teamId]);
  
  const handleFormationChange = (e) => {
    setFormationTemplate(e.target.value);
    // Reset positions when formation changes
    setPositions({});
  };
  
  const athletes = teamMembers.filter(m => m.role === 'athlete');
  
  const handleAssignPlayer = (position, playerId) => {
    setPositions(prev => ({
      ...prev,
      [position]: playerId
    }));
  };
  
  if (loading) return <div>Loading formation setup...</div>;
  
  // Parse formation template
  const [defenders, midfielders, forwards] = formationTemplate.split('-').map(Number);
  
  // Generate positions based on formation
  const generatePositions = () => {
    const positionList = ['GK'];
    
    // Add defenders
    for (let i = 1; i <= defenders; i++) {
      positionList.push(`DEF${i}`);
    }
    
    // Add midfielders
    for (let i = 1; i <= midfielders; i++) {
      positionList.push(`MID${i}`);
    }
    
    // Add forwards
    for (let i = 1; i <= forwards; i++) {
      positionList.push(`FWD${i}`);
    }
    
    return positionList;
  };
  
  const positionList = generatePositions();
  
  return (
    <div className="team-page formation-page">
      <div className="formation-header">
        <h2>Team Formation</h2>
        <div className="formation-controls">
          <select 
            value={formationTemplate} 
            onChange={handleFormationChange}
            className="formation-select"
          >
            <option value="4-4-2">4-4-2</option>
            <option value="4-3-3">4-3-3</option>
            <option value="3-5-2">3-5-2</option>
            <option value="5-3-2">5-3-2</option>
            <option value="4-2-3-1">4-2-3-1</option>
          </select>
          {isManager && (
            <button className="save-formation">Save Formation</button>
          )}
        </div>
      </div>
      
      <div className="formation-container">
        <div className="formation-field">
          {positionList.map((pos, index) => {
            const assignedPlayerId = positions[pos];
            const assignedPlayer = athletes.find(a => a.id === assignedPlayerId);
            
            return (
              <div key={pos} className={`position-slot ${pos}`}>
                <div className="position-label">{pos}</div>
                <div className="player-marker">
                  {assignedPlayer ? (
                    <div className="assigned-player">
                      <div className="player-jersey">{assignedPlayer.jerseyNumber || '?'}</div>
                      <div className="player-name">{assignedPlayer.lastName}</div>
                    </div>
                  ) : (
                    <div className="empty-position">+</div>
                  )}
                </div>
                {isManager && (
                  <select 
                    value={assignedPlayerId || ''} 
                    onChange={(e) => handleAssignPlayer(pos, e.target.value ? Number(e.target.value) : null)}
                    className="player-select"
                  >
                    <option value="">-- Select Player --</option>
                    {athletes.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.firstName} {player.lastName} {player.jerseyNumber ? `(#${player.jerseyNumber})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="formation-bench">
          <h3>Bench</h3>
          <div className="bench-players">
            {athletes
              .filter(player => !Object.values(positions).includes(player.id))
              .map(player => (
                <div key={player.id} className="bench-player">
                  <div className="player-avatar">
                    <img src={player.avatar || '/images/default-avatar.png'} alt={player.firstName} />
                  </div>
                  <div className="player-info">
                    {player.firstName} {player.lastName}
                    {player.jerseyNumber && <span> (#{player.jerseyNumber})</span>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Formation;
