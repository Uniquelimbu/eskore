import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import './FormationStyles.css';

const PlayerChip = ({ 
  id, 
  x, 
  y, 
  label, 
  jerseyNumber, 
  playerName,
  isStarter, 
  draggable, 
  onDropOrSwap,
  isPlaceholder,
  positionId,
  indexInSubs
}) => {
  const playerChipRef = useRef(null);

  // Setup for dragging the chip
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'player',
    item: () => {
      const itemPayload = {
        id,
        isStarterAtDragStart: isStarter,
        originalPositionId: isStarter ? positionId : null,
        originalSubIndex: !isStarter ? indexInSubs : null,
      };
      // console.log('Dragging item:', itemPayload);
      return itemPayload;
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      // console.log('PlayerChip drop result:', dropResult, 'Dragged item:', item);
      if (dropResult && onDropOrSwap) {
        onDropOrSwap(item, dropResult);
      } else {
        // console.log('Player dropped on invalid target or no drop target.');
        // Optionally, trigger a "snap back" action here if not handled by optimistic updates
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => draggable && !isPlaceholder,
  }), [id, isStarter, positionId, indexInSubs, draggable, isPlaceholder, onDropOrSwap]);

  // Setup for this chip being a drop target (for swapping)
  const [{ isOverDropTarget, canDropOnPlayer }, drop] = useDrop(() => ({
    accept: 'player',
    canDrop: (draggedItem) => draggable && draggedItem.id !== id && !isPlaceholder,
    drop: (draggedItem) => {
      // console.log(`PlayerChip ${id} is drop target for ${draggedItem.id}`);
      return {
        type: 'playerSwapTarget',
        targetPlayerId: id,
        targetIsStarter: isStarter,
      };
    },
    collect: (monitor) => ({
      isOverDropTarget: !!monitor.isOver() && monitor.canDrop(),
      canDropOnPlayer: monitor.canDrop(),
    }),
  }), [id, isStarter, draggable, isPlaceholder]);

  // Attach both drag and drop refs to the same element
  drag(drop(playerChipRef));
  
  // Apply the preview to the same element (the default behavior)
  // This is optional since by default the preview attaches to the same element as drag
  preview(playerChipRef);

  const chipStyles = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)',
    opacity: isDragging ? 0.4 : 1,
    cursor: draggable && !isPlaceholder ? 'grab' : 'default',
    zIndex: isDragging ? 9999 : (isOverDropTarget ? 15 : 10), // Higher zIndex when being dragged or hovered over as target
    width: '80px', // Ensure these are consistent
    height: '90px', // Ensure these are consistent
    transition: isDragging ? 'none' : 'transform 0.2s, opacity 0.2s, box-shadow 0.2s',
    boxShadow: isOverDropTarget && canDropOnPlayer ? '0 0 10px 3px rgba(74, 108, 247, 0.7)' : (isDragging ? '0 5px 15px rgba(0,0,0,0.3)' : 'none'),
  };
  
  const chipClasses = `player-chip ${isStarter ? 'starter' : 'substitute'} ${isPlaceholder ? 'placeholder' : ''} ${draggable && !isPlaceholder ? 'draggable' : ''} ${isDragging ? 'dragging' : ''}`;

  return (
    <div
      ref={playerChipRef}
      className={chipClasses}
      style={chipStyles}
      data-player-id={id}
    >
      <div className="player-card-content">
        {!isPlaceholder ? (
          <>
            <div className="position-label">{label}</div>
            <div className="player-name">{playerName || "Unknown"}</div>
            {jerseyNumber && <div className="jersey-number">{jerseyNumber}</div>}
          </>
        ) : (
          <div className="placeholder-icon">UT</div>
        )}
      </div>
    </div>
  );
};

export default PlayerChip;
