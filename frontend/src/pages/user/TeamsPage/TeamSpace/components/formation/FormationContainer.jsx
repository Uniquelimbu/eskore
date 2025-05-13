import React, { useEffect, useRef } from 'react';
import useFormationStore from './formationStore';
import PlayerChip from './PlayerChip';
import PositionPlaceholder from './PositionPlaceholder';
import PresetSelector from './PresetSelector';
import SubsStrip from './SubsStrip';
import './FormationStyles.css';

const PitchMarkings = () => (
  <div className="pitch-markings" style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  }}>
    <div className="center-line" style={{
      position: 'absolute',
      top: '50%',
      left: 0,
      width: '100%',
      height: '2px',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      transform: 'translateY(-50%)'
    }}></div>
    <div className="center-circle" style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '20%',
      height: '0',
      paddingBottom: '20%',
      border: '2px solid rgba(255, 255, 255, 0.7)',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)'
    }}></div>
    <div className="center-dot" style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '4px',
      height: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)'
    }}></div>
    
    <div className="penalty-area-top" style={{
      position: 'absolute',
      top: '10%',
      left: '15%',
      width: '70%',
      height: '20%',
      border: '2px solid rgba(255, 255, 255, 0.7)'
    }}></div>
    <div className="penalty-area-bottom" style={{
      position: 'absolute',
      bottom: '10%',
      left: '15%',
      width: '70%',
      height: '20%',
      border: '2px solid rgba(255, 255, 255, 0.7)'
    }}></div>
    
    <div className="goal-area-top" style={{
      position: 'absolute',
      top: '10%',
      left: '35%',
      width: '30%',
      height: '6%',
      border: '2px solid rgba(255, 255, 255, 0.7)'
    }}></div>
    <div className="goal-area-bottom" style={{
      position: 'absolute',
      bottom: '10%',
      left: '35%',
      width: '30%',
      height: '6%',
      border: '2px solid rgba(255, 255, 255, 0.7)'
    }}></div>
    
    <div className="goal-top" style={{
      position: 'absolute',
      top: '8%',
      left: '42.5%',
      width: '15%',
      height: '2%',
      backgroundColor: 'rgba(255, 255, 255, 0.3)'
    }}></div>
    <div className="goal-bottom" style={{
      position: 'absolute',
      bottom: '8%',
      left: '42.5%',
      width: '15%',
      height: '2%',
      backgroundColor: 'rgba(255, 255, 255, 0.3)'
    }}></div>
    
    {Array.from({ length: 5 }).map((_, i) => (
      <div 
        key={`stripe-${i}`}
        className="field-stripe"
        style={{ 
          position: 'absolute',
          left: 0,
          top: `${i * 20}%`,
          width: '100%',
          height: '10%',
          backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.03)'
        }}
      ></div>
    ))}
  </div>
);

const FormationContainer = ({ teamId, isManager, players = [] }) => {
  const containerRef = useRef(null);
  const pitchRef = useRef(null);
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 450 });
  
  const {
    init,
    starters,
    subs,
    preset,
    loading,
    saved,
    changePreset,
    mapPlayersToPositions,
    movePlayerToPosition, // New store action
    movePlayerToSubSlot,  // New store action
    swapPlayersInFormation, // New store action
    moveStarterToSubsGeneral, // New store action for dropping starter on strip
  } = useFormationStore();
  
  // Get PRESETS from the store
  const { PRESETS } = useFormationStore.getState();
  
  // Initialize formation data
  useEffect(() => {
    console.log("Initializing formation data", { teamId });
    init(teamId);
    
    // The setDummyPlayers call here is redundant.
    // init(teamId) from the store already handles setting dummy players if API data is missing or on error.
    // The mapPlayersToPositions effect will handle mapping real player data when the `players` prop is available.
  }, [teamId, init]); // Removed players.length and setDummyPlayers from dependencies
  
  // Map real players when available
  useEffect(() => {
    if (players.length > 0) {
      console.log("Mapping real players to positions", players.length);
      mapPlayersToPositions(players);
    } else if (starters.length === 0) {
      // Ensure we have at least dummy players if no real players exist
      console.log("No players available, ensuring dummy players exist");
      init(teamId);
    }
  }, [players, mapPlayersToPositions, starters.length, init, teamId]);
  
  // Handle resize for responsive pitch
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.offsetWidth;
      // Maintain 16:9 aspect ratio
      const height = width * (9/16);
      
      console.log("Resizing pitch", { width, height });
      setDimensions({ width, height });
    };
    
    // Initial size
    updateSize();
    
    // Update on resize
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Convert normalized coordinates to actual pixel coordinates
  const normalizedToPixel = (x, y) => {
    return {
      x: (x / 100) * dimensions.width,
      y: (y / 100) * dimensions.height
    };
  };
  
  const handlePlayerDropOrSwap = (draggedItemInfo, dropTargetInfo) => {
    // console.log('FormationContainer: handlePlayerDropOrSwap', draggedItemInfo, dropTargetInfo);
    const { id: draggedPlayerId, isStarterAtDragStart, originalPositionId, originalSubIndex } = draggedItemInfo;
  
    if (!isManager) {
      // console.log("Drag/drop ignored, user is not a manager.");
      return; 
    }

    if (dropTargetInfo.type === 'positionPlaceholder') {
      const targetPositionId = dropTargetInfo.positionId;
      movePlayerToPosition(draggedPlayerId, targetPositionId, isStarterAtDragStart, originalPositionId, originalSubIndex);
    } else if (dropTargetInfo.type === 'subSlot') {
      const targetSubIndex = dropTargetInfo.index;
      movePlayerToSubSlot(draggedPlayerId, targetSubIndex, isStarterAtDragStart, originalPositionId, originalSubIndex);
    } else if (dropTargetInfo.type === 'playerSwapTarget') {
      const targetPlayerId = dropTargetInfo.targetPlayerId;
      swapPlayersInFormation(draggedPlayerId, targetPlayerId);
    } else if (dropTargetInfo.type === 'subsStrip') {
      // Player (likely a starter) was dropped onto the general subs bench area
      moveStarterToSubsGeneral(draggedPlayerId, originalPositionId);
    }
  };
  
  // Create placeholders for all positions in the current formation
  const renderPlaceholders = () => {
    if (!PRESETS || !preset || !PRESETS[preset]) {
      console.error("Missing PRESETS or preset data", { preset, PRESETS });
      return null;
    }
    
    // Find positions that don't have a player
    const filledPositions = starters.map(player => player.id);
    
    return PRESETS[preset]
      .filter(pos => !filledPositions.includes(pos.id))
      .map(pos => {
        const pixelPos = normalizedToPixel(pos.xNorm, pos.yNorm);
        return (
          <PositionPlaceholder
            key={`placeholder-${pos.id}`}
            x={pixelPos.x}
            y={pixelPos.y}
            label={pos.label}
            positionId={pos.id}
            isManager={isManager} // Pass isManager for canDrop
            // onDrop is not needed here, handled by PlayerChip's endDrag
          />
        );
      });
  };
  
  // Save formation as PNG
  const handleExportPNG = () => {
    if (containerRef.current) {
      alert('Export PNG feature will be implemented here');
    }
  };
  
  // Add pitch container style
  const pitchContainerStyle = {
    width: '100%',
    overflow: 'hidden',
    borderRadius: '0.375rem',
    position: 'relative',
    backgroundColor: '#006341' // FIFA-style pitch color
  };
  
  // Add pitch style
  const pitchStyle = {
    position: 'relative',
    width: '100%',
    height: `${dimensions.height}px`,
    overflow: 'hidden'
  };
  
  console.log("Render FormationContainer", { starters: starters.length, subs: subs.length, isManager });
  
  return (
    <div className="formation-container" style={{ backgroundColor: '#1a202c', padding: '1rem', borderRadius: '0.5rem' }}>
      <div className="formation-header" style={{ marginBottom: '1rem' }}>
        <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Team Formation</h2>
        <div className="formation-controls" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: '0.75rem' 
        }}>
          <div className="formation-selector-wrapper">
            <PresetSelector 
              currentPreset={preset} 
              onChangePreset={changePreset}
              disabled={!isManager}
            />
          </div>
          
          <div className="formation-actions" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginLeft: '1.5rem' // Add specific left margin to create more space
          }}>
            <button
              className="export-button"
              onClick={handleExportPNG}
              style={{ 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Export PNG
            </button>
            
            {!saved && (
              <span style={{ 
                color: '#facc15', 
                animation: 'pulse 2s infinite',
                fontSize: '0.875rem',
                marginLeft: '0.5rem' // Add some spacing for the status indicator
              }}>
                {loading ? 'Saving...' : 'Changes not saved'}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        style={pitchContainerStyle}
      >
        <div 
          ref={pitchRef}
          style={pitchStyle}
        >
          <PitchMarkings />
          
          {/* Position placeholders - only render if isManager is true */}
          {isManager && renderPlaceholders()}
          
          {/* Player chips */}
          {starters.map(player => {
            if (!player) return null;
            const pixelPos = normalizedToPixel(player.xNorm, player.yNorm);
            return (
              <PlayerChip
                key={player.id}
                id={player.id}
                x={pixelPos.x}
                y={pixelPos.y}
                label={player.position || player.label}
                jerseyNumber={player.jerseyNumber}
                playerName={player.playerName}
                isStarter={true}
                draggable={isManager}
                onDropOrSwap={handlePlayerDropOrSwap} // Unified handler
                isPlaceholder={false} // Starters are not placeholders
                positionId={player.positionId} // The slot this starter occupies
                indexInSubs={null} // Not a sub
              />
            );
          })}
        </div>
      </div>
      
      <SubsStrip 
        subs={subs} 
        draggable={isManager}
        onDropOrSwap={handlePlayerDropOrSwap} // Pass unified handler
        showPlaceholders={isManager && subs.length < 7} // Max 7 subs generally
        isManager={isManager}
      />
      
      <div className="formation-notes" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Formation Notes</h3>
        <textarea
          className="w-full h-24 bg-gray-800 border border-gray-700 rounded p-2 text-white"
          placeholder={isManager ? "Add tactical notes here..." : "No tactical notes yet."}
          disabled={!isManager}
          style={{
            width: '100%',
            height: '6rem',
            backgroundColor: '#2d3748',
            border: '1px solid #4a5568',
            borderRadius: '0.375rem',
            padding: '0.5rem',
            color: 'white',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );
};

export default FormationContainer;
