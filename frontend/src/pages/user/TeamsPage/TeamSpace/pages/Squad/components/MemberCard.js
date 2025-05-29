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
  
  // Generate initials for the avatar placeholder
  const getInitials = () => {
    if (!member.firstName && !member.lastName) return "?";
    return `${(member.firstName || "").charAt(0)}${(member.lastName || "").charAt(0)}`.toUpperCase();
  };

  // Destructure only what we need, removing 'country' if not used
  const { firstName, lastName, email, role, profileImageUrl } = member;

  return (
    <div className="member-card">
      <div className="member-avatar">
        {avatar ? (
          <img src={avatar} alt={memberName} />
        ) : (
          <div className="member-avatar-placeholder">
            {getInitials()}
          </div>
        )}
      </div>
      
      <div className="member-info">
        <h4>{memberName}</h4>
        <div className="member-details">
          {/* Role badge moved out of member-details */}
        </div>
      </div>
      
      {/* Role badge moved here to position on the right */}
      <span className={`role-badge ${category}`}>{roleLabel}</span>
      
      {category === 'athlete' && member.Player?.jerseyNumber && (
        <div className="jersey-number">#{member.Player.jerseyNumber}</div>
      )}
      
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
