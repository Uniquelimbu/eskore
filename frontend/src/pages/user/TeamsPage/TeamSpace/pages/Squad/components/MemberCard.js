import React from 'react';
import '../styles/MemberCard.css';

const MemberCard = ({ member, onRemove, isManager, category }) => {
  const memberName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
  
  // Determine which label to display (Athlete, Manager, etc.)
  const roleLabel = category === 'athlete' ? 'Athlete' :
                    member.role === 'manager' ? 'Manager' :
                    member.role === 'assistant_manager' ? 'Assistant Manager' :
                    member.role === 'coach' ? 'Coach' : 'Member';
  
  // Get avatar/image or use default
  const avatar = member.avatar || 
                member.profileImageUrl ||
                member.Player?.profileImageUrl || 
                null;

  // Destructure only what we need
  const { id, firstName, lastName, email, role, profileImageUrl, jerseyNumber, position } = member;
  
  // Get position code for athletes
  const positionCode = category === 'athlete' && member.Player?.position 
                      ? member.Player.position 
                      : category === 'athlete' ? 'ATH' : roleLabel.substring(0, 3).toUpperCase();

  return (
    <div className="member-card">
      {/* New badge-style avatar */}
      <div className="member-badge">
        <div className="member-badge-top">
          <div className="position-code">{positionCode}</div>
          {category === 'athlete' && member.Player?.jerseyNumber && (
            <div className="badge-jersey-number">{member.Player.jerseyNumber}</div>
          )}
        </div>
        <div className="member-badge-middle">
          {avatar ? (
            <img src={avatar} alt={memberName} />
          ) : (
            <div className="player-silhouette"></div>
          )}
        </div>
        <div className="member-badge-bottom">
          <div className="badge-player-name">{memberName || "Unknown"}</div>
        </div>
      </div>
      
      <div className="member-info">
        <h4>{memberName}</h4>
        <div className="member-details">
          {/* Original member details remain unchanged */}
        </div>
      </div>
      
      {/* Role badge moved here to position on the right */}
      <span className={`role-badge ${category}`}>{roleLabel}</span>
      
      {isManager && member.role !== 'manager' && (
        <div className="member-actions">
          <button 
            className="remove-member-btn" 
            onClick={() => onRemove(member.id)}
            title="Remove member"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
