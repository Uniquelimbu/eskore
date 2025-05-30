import React from 'react';
import MemberCard from './MemberCard';
import '../styles/MemberList.css';

const MemberList = ({ title, members, isManager, onRemoveMember, category, categoryFilter }) => {
  if (!Array.isArray(members)) {
    console.error('MemberList: members is not an array', members);
    return null;
  }
  
  // Filter members if a categoryFilter is provided
  const filteredMembers = categoryFilter 
    ? members.filter(member => {
        if (categoryFilter === 'athlete') return member.role === 'athlete';
        if (categoryFilter === 'manager') return ['manager', 'assistant_manager'].includes(member.role);
        if (categoryFilter === 'coach') return member.role === 'coach';
        return true; // All members if no filter
      })
    : members;

  // If no members after filtering
  if (filteredMembers.length === 0) {
    return (
      <div className="empty-member-list">
        <p>No team members in this category.</p>
      </div>
    );
  }

  return (
    <div className="squad-section">
      <h3>{title} ({filteredMembers.length})</h3>
      <div className="squad-members">
        {filteredMembers.map((member) => {
          // Ensure we have a valid ID for the key
          const memberId = member.id || member.userId || `member-${Date.now()}-${Math.random()}`;
          
          return (
            <MemberCard
              key={memberId}
              member={member}
              onRemove={onRemoveMember}
              isManager={isManager}
              category={
                member.role === 'athlete' ? 'athlete' :
                ['manager', 'assistant_manager'].includes(member.role) ? 'manager' : 'coach'
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default MemberList;
