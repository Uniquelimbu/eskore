import React from 'react';
import '../styles/SquadHeader.css';

const SquadHeader = ({ onBack, onAddMember, onJoinTeam, isManager, isMember }) => {
  return (
    <div className="squad-header">
      <button className="back-button" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Squad</h2>
      <div className="squad-actions">
        {isManager && (
          <button className="add-member-btn" onClick={onAddMember}>
            Add Member
          </button>
        )}
        {!isMember && !isManager && (
          <button className="join-team-btn" onClick={onJoinTeam}>
            Join Team
          </button>
        )}
      </div>
    </div>
  );
};

export default SquadHeader;
