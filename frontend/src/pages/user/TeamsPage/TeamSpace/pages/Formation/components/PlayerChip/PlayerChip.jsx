import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import '../FormationBoard/styles/index.css'; // Updated CSS import path

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
  indexInSubs,
  isSelected,
  onSelect,
  isSwapping
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
      return itemPayload;
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && onDropOrSwap) {
        onDropOrSwap(item, dropResult);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => draggable && !isPlaceholder,
  }), [id, isStarter, positionId, indexInSubs, draggable, isPlaceholder, onDropOrSwap]);

  // Setup for this chip being a drop target (for swapping)
  const [{ isOverDropTarget }, drop] = useDrop(() => ({
    accept: 'player',
    canDrop: (draggedItem) => draggable && draggedItem.id !== id,
    drop: (draggedItem) => {
      return {
        type: 'playerSwapTarget',
        targetPlayerId: id,
        targetIsStarter: isStarter,
      };
    },
    collect: (monitor) => ({
      isOverDropTarget: !!monitor.isOver() && monitor.canDrop(),
    }),
  }), [id, isStarter, draggable]);

  // Attach both drag and drop refs to the same element
  drag(drop(playerChipRef));
  preview(playerChipRef);

  // Handle click for selection
  const handleClick = () => {
    if (onSelect && !isSwapping) {
      onSelect(id, isStarter, positionId, indexInSubs);
    }
  };

  const chipStyles = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    transform: 'translate(-50%, -50%)',
    opacity: isDragging ? 0.4 : 1,
    cursor: draggable ? 'grab' : isSwapping ? 'not-allowed' : 'pointer',
    zIndex: isDragging ? 9999 : (isOverDropTarget || isSelected || isSwapping ? 15 : 10),
    width: '80px',
    height: '110px', // Increased to accommodate badge shape
    transition: isDragging ? 'none' : 'transform 0.2s, opacity 0.2s, box-shadow 0.2s',
  };
  
  const chipClasses = `player-chip ${isStarter ? 'starter' : 'substitute'} ${isPlaceholder ? 'placeholder' : ''} ${draggable ? 'draggable' : ''} ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''} ${isSwapping ? 'swapping' : ''}`;

  // Create silhouette style with direct image reference
  const silhouetteStyle = {
    width: '80%',
    height: '80%',
    backgroundImage: `url(${process.env.PUBLIC_URL}/images/player-silhouette.png)`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    opacity: 0.7,
  };

  return (
    <div
      ref={playerChipRef}
      className={chipClasses}
      style={chipStyles}
      data-player-id={id}
      data-position-id={positionId} /* Add position ID for better tracking */
      onClick={handleClick}
    >
      {!isPlaceholder ? (
        <div className="player-badge-card">
          <div className="player-badge-top">
            <div className="position-code">{label}</div>
            {jerseyNumber && <div className="jersey-number">{jerseyNumber}</div>}
          </div>
          <div className="player-badge-middle">
            <div style={silhouetteStyle}></div>
          </div>
          <div className="player-badge-bottom">
            <div className="player-name">{playerName || "Unknown"}</div>
          </div>
        </div>
      ) : (
        <div className="player-badge-card placeholder">
          <div className="player-badge-top">
            <div className="position-code">{label}</div>
          </div>
          <div className="player-badge-middle">
            <div style={silhouetteStyle}></div>
          </div>
          <div className="player-badge-bottom">
            <div className="placeholder-label">EMPTY</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerChip;
