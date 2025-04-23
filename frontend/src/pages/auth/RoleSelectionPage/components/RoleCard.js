import React from 'react';
import PropTypes from 'prop-types';
import { createNamespace } from '../../../../utils/cssUtils';
import './RoleCard.css';

// Create namespaced class helpers
const ns = createNamespace('role-card');

const RoleCard = ({ role, isSelected, onSelect }) => {
  // Use namespace helpers to create class names
  const cardClass = ns.classes(
    ns.cls(),
    isSelected && ns.modifier('', 'selected') 
  );

  const iconClass = ns.classes(
    ns.cls('icon'),
    ns.modifier('icon', role.id)
  );

  return (
    <div className={cardClass} onClick={onSelect}>
      <div className={iconClass}>
        {role.icon}
      </div>
      <div className={ns.cls('content')}>
        <h3 className={ns.cls('title')}>{role.title}</h3>
        <p className={ns.cls('description')}>{role.description}</p>
      </div>
    </div>
  );
};

RoleCard.propTypes = {
  role: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired
};

export default RoleCard;
