import React from 'react';
import { useDrop } from 'react-dnd';
import '../../FormationBoard/styles/index.css'; // Corrected CSS import path

const PositionPlaceholder = ({ x, y, label, positionId, isManager }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'player',
    canDrop: () => isManager,
    drop: () => {
      return {
        type: 'positionPlaceholder',
        positionId: positionId,
      };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop() && isManager,
    }),
  }), [positionId, isManager]);
  
  const placeholderStyles = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: isOver && canDrop ? 5 : 1,
  };
  
  const circleClass = `position-placeholder-circle ${isOver && canDrop ? 'active' : ''}`;

  return (
    <div
      ref={drop}
      className={`position-placeholder ${isOver && canDrop ? 'can-drop-hover' : ''}`}
      style={placeholderStyles}
      data-position-id={positionId}
    >
      <div className={circleClass}>
        <div className="position-placeholder-label">{label}</div>
        <div className="position-placeholder-plus">+</div>
      </div>
    </div>
  );
};

export default PositionPlaceholder;
