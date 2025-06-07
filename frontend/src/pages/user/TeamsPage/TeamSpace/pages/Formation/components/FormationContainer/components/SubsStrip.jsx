import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import PlayerChip from '../../PlayerChip/PlayerChip'; // Corrected PlayerChip import path
import '../../FormationBoard/styles/index.css'; // Corrected CSS import path

// Empty placeholder for subs slot
const SubPlaceholder = ({ x, y, index, isManager, onDropOrSwap }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'player',
    canDrop: () => isManager,
    drop: (item) => {
      return { type: 'subSlot', index: index };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop() && isManager,
    }),
  }), [index, isManager]);

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
  const circleClass = `sub-placeholder-circle ${isOver && canDrop ? 'active' : ''}`;

  return (
    <div 
      ref={drop}
      className={`sub-placeholder ${isOver && canDrop ? 'can-drop-hover' : ''}`}
      style={placeholderStyles}
      data-sub-index={index}
    >
      <div className={circleClass}>
        <span className="sub-text">SUB</span>
      </div>
    </div>
  );
};

const SubsStrip = ({ 
  subs, 
  draggable, 
  onDropOrSwap, 
  showPlaceholders = false, 
  isManager = true,
  selectedPlayer,
  onPlayerSelect,
  swappingPlayers = []
}) => {
  const containerRef = useRef(null);
  const [stripDimensions, setStripDimensions] = React.useState({ width: 800, height: 140 });
  
  // Handle strip sizing for responsive design
  React.useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.offsetWidth;
      const height = 140; // Fixed height for subs strip
      
      setStripDimensions({ width, height });
    };
    
    // Initial size and resize handling
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  const [{ isOverStrip, canDropOnStrip }, stripDropRef] = useDrop(() => ({
    accept: 'player',
    canDrop: (item) => isManager && draggable && item.isStarterAtDragStart,
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      return { type: 'subsStrip', index: -1 }; 
    },
    collect: (monitor) => ({
      isOverStrip: !!monitor.isOver() && monitor.canDrop() && !monitor.didDrop(),
      canDropOnStrip: monitor.canDrop() && !monitor.didDrop(),
    }),
  }), [isManager, draggable]);
  
  // Calculate chip positions in the strip
  const getChipPosition = (index, totalSlots = 8) => {
    const spacing = Math.min(100, (stripDimensions.width - 40) / (totalSlots + 1));
    
    return {
      x: 20 + (index + 1) * spacing,
      y: stripDimensions.height / 2
    };
  };
  
  // Generate empty placeholders if needed - exactly 7 total slots
  const renderPlaceholders = () => {
    const totalSlots = 7; // Fixed at exactly 7 subs
    const occupiedSlots = subs.length;
    const emptySlotsToRender = Math.max(0, totalSlots - occupiedSlots);
    
    return Array.from({ length: emptySlotsToRender }).map((_, i) => {
      const placeholderIndex = occupiedSlots + i;
      const pos = getChipPosition(placeholderIndex, totalSlots);
      return (
        <SubPlaceholder 
          key={`sub-placeholder-${placeholderIndex}`} 
          x={pos.x} 
          y={pos.y} 
          index={placeholderIndex}
          isManager={isManager}
        />
      );
    });
  };
  
  // Add custom strip style
  const stripStyle = {
    position: 'relative',
    width: '100%',
    height: `${stripDimensions.height}px`,
    backgroundColor: isOverStrip && canDropOnStrip ? 'rgba(74, 108, 247, 0.1)' : '#1a1a1a',
    boxShadow: isOverStrip && canDropOnStrip ? 'inset 0 0 0 2px rgba(74, 108, 247, 0.5)' : 'none',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease'
  };
  
  // Check if a player is currently being swapped
  const isPlayerSwapping = (playerId) => {
    return swappingPlayers.includes(playerId);
  };
  
  return (
    <div 
      ref={containerRef}
      className="subs-strip-container"
      style={{
        marginTop: '1rem',
        backgroundColor: '#1a1a1a',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        borderTop: '2px solid #2d2d2d'
      }}
    >
      <div 
        className="subs-strip-header" 
        style={{
          backgroundColor: '#2d2d2d',
          padding: '0.5rem 1rem'
        }}
      >
        <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>Substitutes</h3>
      </div>
      
      <div 
        ref={stripDropRef}
        className={`subs-strip ${isOverStrip && canDropOnStrip ? 'strip-highlight' : ''}`}
        style={stripStyle}
      >
        {/* Actual player chips */}
        {subs.slice(0, 7).map((sub, index) => { /* Ensure max 7 subs are rendered */
          if (!sub) return null;
          const pos = getChipPosition(index, 7); /* Fixed at 7 total slots */
          // Create truly unique key using multiple identifiers to prevent duplicates
          const uniqueKey = `sub-${sub.playerId || sub.id}-position-${index}-${sub.jerseyNumber || 'no-jersey'}`;
          return (
            <PlayerChip
              key={uniqueKey}
              id={sub.id}
              x={pos.x}
              y={pos.y}
              label={sub.position || sub.label || 'SUB'}
              jerseyNumber={sub.jerseyNumber}
              playerName={sub.playerName}
              isStarter={false}
              draggable={draggable && !sub.isPlaceholder && isManager}
              onDropOrSwap={onDropOrSwap}
              isPlaceholder={sub.isPlaceholder}
              indexInSubs={index}
              positionId={null}
              isSelected={selectedPlayer?.id === sub.id}
              onSelect={onPlayerSelect}
              isSwapping={isPlayerSwapping(sub.id)}
            />
          );
        })}
        
        {/* Empty placeholders if enabled and needed */}
        {showPlaceholders && renderPlaceholders()}
        
        {subs.length === 0 && !showPlaceholders && (
          <div className="empty-subs-message" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#777',
            padding: '1rem',
            textAlign: 'center'
          }}>
            No substitutes available
          </div>
        )}
      </div>
    </div>
  );
};

export default SubsStrip;