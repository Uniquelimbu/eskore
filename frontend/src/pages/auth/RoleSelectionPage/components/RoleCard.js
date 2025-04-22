import React from 'react';

const RoleCard = ({ role, isSelected, onSelect }) => {
  return (
    <div 
      className={`role-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="role-icon">{role.icon}</div>
      <h3 className="role-title">{role.title}</h3>
      <p className="role-description">{role.description}</p>
    </div>
  );
};

export default RoleCard;
