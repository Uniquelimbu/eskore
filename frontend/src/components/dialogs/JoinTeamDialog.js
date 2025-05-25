import React, { useState } from 'react';
import PlayerRegistrationForm from '../forms/PlayerRegistrationForm';
import './JoinTeamDialog.css';

const JoinTeamDialog = ({ team, onJoin, onCancel }) => {
  const [joinMode, setJoinMode] = useState(null); // null, 'player', 'staff'
  const [playerData, setPlayerData] = useState(null);
  
  const handleJoinModeSelect = (mode) => {
    setJoinMode(mode);
  };
  
  const handlePlayerRegistrationSubmit = (data) => {
    setPlayerData(data);
    // Submit both the join request and player data together
    onJoin({
      teamId: team.id,
      role: 'athlete',
      playerData: data
    });
  };

  const handleStaffJoinSubmit = () => {
    // For now, we're not implementing this as per requirements
    alert("Staff joining functionality is not implemented yet");
  };

  // Initial join options selector
  if (joinMode === null) {
    return (
      <div className="join-team-dialog-overlay">
        <div className="join-team-dialog">
          <button className="close-button" onClick={onCancel}>&times;</button>
          <h2>Join {team.name}</h2>
          <p>How would you like to join this team?</p>
          
          <div className="join-options">
            <div className="join-option" onClick={() => handleJoinModeSelect('player')}>
              <div className="option-icon player-icon">👤</div>
              <h3>Join as Player</h3>
              <p>You'll be added to the team as an athlete</p>
            </div>
            
            <div className="join-option disabled">
              <div className="option-icon staff-icon">👥</div>
              <h3>Join as Team Staff</h3>
              <p>Coming soon - this feature is not available yet</p>
              <div className="coming-soon-badge">Coming Soon</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Player registration form
  if (joinMode === 'player') {
    return (
      <div className="join-team-dialog-overlay">
        <div className="join-team-dialog wide">
          <button className="close-button" onClick={onCancel}>&times;</button>
          <PlayerRegistrationForm
            onSubmit={handlePlayerRegistrationSubmit}
            onCancel={() => setJoinMode(null)}
          />
        </div>
      </div>
    );
  }

  // Staff join form - not implementing now
  return (
    <div className="join-team-dialog-overlay">
      <div className="join-team-dialog">
        <button className="close-button" onClick={onCancel}>&times;</button>
        <h2>Staff Registration</h2>
        <p>This feature is not implemented yet.</p>
        <div className="form-actions">
          <button onClick={() => setJoinMode(null)}>Back</button>
        </div>
      </div>
    </div>
  );
};

export default JoinTeamDialog;
