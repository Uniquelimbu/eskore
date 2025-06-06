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
  const { id, firstName, lastName, role, profileImageUrl, jerseyNumber, position } = member;
  
  // Generate initials from first and last name
  const initials = `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
  
  // Get position info for display
  const positionInfo = category === 'athlete' && member.Player?.position 
                      ? member.Player.position 
                      : null;
  const jerseyNum = category === 'athlete' && member.Player?.jerseyNumber
                      ? member.Player.jerseyNumber
                      : null;

  return (
    <div className="member-card">
      <div className="member-avatar">
        {avatar ? (
          <img src={avatar} alt={memberName} className="member-avatar-img" />
        ) : (
          <div className="member-avatar-placeholder">
            {initials || "?"}
          </div>
        )}
        {jerseyNum && <div className="jersey-number-badge">{jerseyNum}</div>}
      </div>
      
      <div className="member-info">
        <h4>{memberName}</h4>
        <div className="member-details">
          {positionInfo && (
            <span className="member-position">{positionInfo}</span>
          )}
          {/* Email display removed */}
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
