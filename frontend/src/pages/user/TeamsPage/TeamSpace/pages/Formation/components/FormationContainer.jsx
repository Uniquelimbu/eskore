import React, { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useFormationStore from './formationStore';
import PlayerChip from './PlayerChip';
import PositionPlaceholder from './PositionPlaceholder';
import SubsStrip from './SubsStrip';
import Edit from './Tabs/Edit/Edit';
import './FormationStyles.css';

// Position marker component to show the preset position - updating to make it more visible
const PositionMarker = ({ x, y, label }) => {
  return (
    <div className="position-marker" style={{ left: `${x}px`, top: `${y}px` }}>
      <div className="position-marker-label">{label}</div>
    </div>
  );
};

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
  const [showEditTab, setShowEditTab] = useState(false);
  
  const {
    init,
    starters,
    subs,
    preset,
    loading,
    mapPlayersToPositions,
    movePlayerToPosition,
    movePlayerToSubSlot,
    swapPlayersInFormation,
    moveStarterToSubsGeneral,
    changePreset,
  } = useFormationStore();
  
  // Get PRESETS from the store
  const { PRESETS } = useFormationStore.getState();
  
  // Initialize formation data
  useEffect(() => {
    console.log("Initializing formation data", { teamId });
    init(teamId);
  }, [teamId, init]);
  
  // Map real players when available
  useEffect(() => {
    if (players.length > 0) {
      console.log("Mapping real players to positions", players.length);
      mapPlayersToPositions(players);
    } else if (players.length === 0 && starters.length === 0 && !loading) {
      // If we still have no starters after the initial load (and no real players),
      // populate the pitch with dummy players so the UI is never blank.
      console.log("No players and no starters – inserting dummy players for display");
      useFormationStore.getState().setDummyPlayers();
    }
  }, [players, mapPlayersToPositions, starters.length, loading]);
  
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
    
    // Add defensive check to ensure starters is an array
    const startersArray = Array.isArray(starters) ? starters : [];
    console.log("renderPlaceholders with starters:", { starters: startersArray, type: typeof starters });
    
    // Find positions that don't have a player
    const filledPositions = startersArray.map(player => player.id);
    
    return PRESETS[preset]
      .filter(pos => !filledPositions.includes(pos.id))
      .map(pos => {
        const pixelPos = normalizedToPixel(pos.xNorm, pos.yNorm);
        return (
          <PositionPlaceholder
            key={`placeholder-${pos.id}`}
            x={pixelPos.x}
            y={pixelPos.y - 15} // Move placeholder UP by 15px 
            label={pos.label}
            positionId={pos.id}
            isManager={isManager} // Pass isManager for canDrop
            // onDrop is not needed here, handled by PlayerChip's endDrag
          />
        );
      });
  };
  
  const handlePresetChange = (newPreset) => {
    changePreset(newPreset);
    setShowEditTab(false);
  };
  
  // Add explicit debugging for manager status
  useEffect(() => {
    console.log(`FormationContainer: Manager status received: ${isManager}`);
    // If we're not a manager but should be (e.g., this is your team), log it for debugging
  }, [isManager]);
  
  // Add state for tracking selected players and animations
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [swappingPlayers, setSwappingPlayers] = useState([]);
  
  // Get player elements and positions
  const getPlayerRef = (id) => {
    return document.querySelector(`[data-player-id="${id}"]`);
  };
  
  // Function to handle player selection with animation
  const handlePlayerSelect = (playerId, isStarter, positionId, indexInSubs) => {
    if (!isManager || swappingPlayers.length > 0) return; // Prevent selection while animating

    if (selectedPlayer === null) {
      // First player selected
      setSelectedPlayer({
        id: playerId,
        isStarter,
        positionId,
        indexInSubs
      });
    } else if (selectedPlayer.id === playerId) {
      // Same player clicked again - deselect
      setSelectedPlayer(null);
    } else {
      // Different player selected - perform swap with animation
      
      // Mark these players as swapping (for CSS class)
      setSwappingPlayers([selectedPlayer.id, playerId]);
      
      // Update the store immediately to change positions
      swapPlayersInFormation(selectedPlayer.id, playerId);
      
      // After animation duration, clear the animation state
      setTimeout(() => {
        setSwappingPlayers([]);
        setSelectedPlayer(null); // Clear selection after swap
      }, 500); // Duration should match CSS transition time
    }
  };
  
  // Check if a player is currently being swapped
  const isPlayerSwapping = (playerId) => {
    return swappingPlayers.includes(playerId);
  };
  
  // Handle clicking outside of player chips to clear selection
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // If clicked element is not a player-chip, clear selection
      if (!e.target.closest('.player-chip') && selectedPlayer) {
        setSelectedPlayer(null);
      }
    };
    
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [selectedPlayer]);
  
  // When tab changes or preset changes, clear selection
  useEffect(() => {
    setSelectedPlayer(null);
  }, [showEditTab, preset]);
  
  // Render position markers for the preset formation - keep them at exact formation positions
  const renderPositionMarkers = () => {
    if (!PRESETS || !preset || !PRESETS[preset]) {
      return null;
    }
    
    return PRESETS[preset].map(pos => {
      const pixelPos = normalizedToPixel(pos.xNorm, pos.yNorm);
      return (
        <PositionMarker
          key={`marker-${pos.id}`}
          x={pixelPos.x}
          y={pixelPos.y + 45} // Keep label 45px DOWN (below where player chips will be)
          label={pos.label}
        />
      );
    });
  };
  
  console.log("Render FormationContainer", { starters: starters.length, subs: subs.length, isManager });
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="formation-container" style={{ backgroundColor: '#1a202c', padding: '1rem', borderRadius: '0.5rem' }}>
        {showEditTab ? (
          <Edit 
            onSelectPreset={handlePresetChange} 
            currentPreset={preset}
            onClose={() => setShowEditTab(false)}
            isManager={isManager}
          />
        ) : (
          <>
            <div className="formation-header-controls">
              <div className="formation-current-preset">
                <span className="preset-label">Formation:</span>
                <span className="preset-value">{preset}</span>
              </div>
              
              {isManager && (
                <button 
                  className="edit-formation-button"
                  onClick={() => setShowEditTab(true)}
                  disabled={!isManager}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                  </svg>
                  Edit
                </button>
              )}
            </div>
            
            <div 
              ref={containerRef} 
              style={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: '0.375rem',
                position: 'relative',
                backgroundColor: '#006341' // FIFA-style pitch color
              }}
            >
              <div 
                ref={pitchRef}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: `${dimensions.height}px`,
                  overflow: 'hidden'
                }}
              >
                <PitchMarkings />
                
                {/* Render position markers for the preset formation */}
                {renderPositionMarkers()}
                
                {/* Position placeholders - only render if isManager is true */}
                {isManager && renderPlaceholders()}
                
                {/* Player chips - keep them at their original position (no offset) */}
                {Array.isArray(starters) ? starters.map(player => {
                  if (!player) return null;
                  const pixelPos = normalizedToPixel(player.xNorm, player.yNorm);
                  return (
                    <PlayerChip
                      key={player.id}
                      id={player.id}
                      x={pixelPos.x}
                      y={pixelPos.y - 15} // Move player chips UP by 15px to match placeholder positions
                      label={player.position || player.label}
                      jerseyNumber={player.jerseyNumber}
                      playerName={player.playerName}
                      isStarter={true}
                      draggable={isManager && swappingPlayers.length === 0}
                      onDropOrSwap={handlePlayerDropOrSwap}
                      isPlaceholder={false}
                      positionId={player.positionId}
                      indexInSubs={null}
                      isSelected={selectedPlayer?.id === player.id}
                      onSelect={handlePlayerSelect}
                      isSwapping={isPlayerSwapping(player.id)}
                    />
                  );
                }) : null}
              </div>
            </div>
            
            <SubsStrip 
              subs={subs} 
              draggable={isManager && swappingPlayers.length === 0}
              onDropOrSwap={handlePlayerDropOrSwap}
              showPlaceholders={isManager && subs.length < 7}
              isManager={isManager}
              selectedPlayer={selectedPlayer}
              onPlayerSelect={handlePlayerSelect}
              swappingPlayers={swappingPlayers}
            />
          </>
        )}
      </div>
    </DndProvider>
  );
};

export default FormationContainer;
