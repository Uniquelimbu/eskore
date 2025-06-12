import React from 'react';
import '../styles/SquadHeader.css';

const SquadHeader = ({ onBack, onJoinTeam, isManager, isMember, team, joinRequestsCount }) => {
  return (
    <div className="squad-header">
      <button className="back-button-squad" onClick={onBack}>
        ← Back
      </button>
      
      <div className="squad-header-content">
        <h1>Squad</h1>
        
        <div className="squad-actions">
          {!isMember && (
            <button className="join-team-button" onClick={onJoinTeam}>
              Join Team
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SquadHeader;
