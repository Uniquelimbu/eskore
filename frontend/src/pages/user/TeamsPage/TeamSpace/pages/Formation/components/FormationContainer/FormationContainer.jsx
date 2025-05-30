import React, { useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { apiClient } from '../../../../../../../../services'; // Updated import path

// Import store and components
import useFormationStore from '../FormationBoard'; 
import PlayerChip from '../PlayerChip/PlayerChip';
import Edit from '../Tabs/Edit/Edit';

// Import extracted components
import { PositionMarker, PitchMarkings, PositionPlaceholder, SubsStrip } from './components';

// Import utilities
import { normalizedToPixel, isPlayerSwapping, createPositionPlaceholders, createPositionMarkers } from './utils/positionUtils';
import { handlePlayerSelect, handlePlayerDropOrSwap, handlePresetChange } from './utils/eventHandlers';

// Import styles
import '../FormationBoard/styles/index.css';
import './styles/index.css';

const FormationContainer = ({ teamId, isManager, players = [] }) => {
  const pitchRef = useRef(null);
  const containerRef = useRef(null); // Added missing ref
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 450 });
  const [showEditTab, setShowEditTab] = useState(false);
  // const [isSaving, setIsSaving] = useState(false); // Local isSaving is no longer primary for display

  // Get store actions and state
  const {
    init,
    starters,
    subs,
    preset,
    loading,
    saved,
    mapPlayersToPositions,
    movePlayerToPosition,
    movePlayerToSubSlot,
    swapPlayersInFormation,
    moveStarterToSubsGeneral,
    changePreset,
    exportAsPNG,
    saveFormation,
  } = useFormationStore();
  
  // Get PRESETS from the store
  const { PRESETS } = useFormationStore.getState();
  
  // Add state for tracking selected players and animations
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [swappingPlayers, setSwappingPlayers] = useState([]);
  const [managerPreferredFormation, setManagerPreferredFormation] = useState(null);
  
  // Initialize formation data
  useEffect(() => {
    console.log("Initializing formation data", { teamId });
    
    // First, try to get manager's preferred formation if available
    const fetchManagerPreferences = async () => {
      try {
        // Get team managers information
        const managersResponse = await apiClient.get(`/teams/${teamId}/managers`);
        
        if (managersResponse && Array.isArray(managersResponse.managers) && managersResponse.managers.length > 0) {
          // Find the first active manager with a preferred formation
          const managerWithFormation = managersResponse.managers.find(m => m.preferredFormation);
          
          if (managerWithFormation && managerWithFormation.preferredFormation) {
            const preferredPreset = typeof managerWithFormation.preferredFormation === 'string' 
              ? managerWithFormation.preferredFormation 
              : (managerWithFormation.preferredFormation.preset || '4-3-3');
              
            console.log("Using manager's preferred formation:", preferredPreset);
            setManagerPreferredFormation(preferredPreset);
            
            // Set the preferred formation as the preset before initializing
            useFormationStore.setState({ preset: preferredPreset });
            
            // Pass the preferred formation to init so it knows what to default to
            init(teamId, preferredPreset);
            return; // Exit early since we've initialized with the preferred preset
          }
        }
        
        // If we get here, no manager preferences were found, use default initialization
        init(teamId);
      } catch (err) {
        console.warn("Could not fetch manager preferences:", err);
        // Continue with normal initialization on error
        init(teamId);
      }
    };
    
    fetchManagerPreferences();
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
      
      // Use the manager's preferred formation if available, otherwise use default
      const formationToUse = managerPreferredFormation || preset || '4-3-3';
      console.log(`Using formation preset: ${formationToUse} for dummy players`);
      
      useFormationStore.getState().setDummyPlayers(formationToUse);
    }
  }, [players, mapPlayersToPositions, starters.length, loading, managerPreferredFormation, preset]);
  
  // Save changes when formation is updated
  useEffect(() => {
    // Use store's `loading` state to prevent concurrent saves triggered by this effect
    if (!saved && !loading && teamId) {
      const saveChanges = async () => {
        // setIsSaving(true); // Not needed if UI relies on store.loading
        try {
          console.log("Formation container: Detected unsaved changes, triggering save (useEffect [saved, loading, teamId])");
          
          const result = await saveFormation(); // Calls store's saveFormation -> forceSave
          
          if (result && result.success) {
            console.log("Formation container: Formation saved successfully (useEffect [saved, loading, teamId])");
          } else {
            console.error("Formation container: Error saving formation (useEffect [saved, loading, teamId]):", 
              result ? result.error : "No result returned from save operation");
          }
        } catch (error) {
          console.error("Formation container: Exception during save (useEffect [saved, loading, teamId]):", error);
        } finally {
          // setIsSaving(false); // Not needed if UI relies on store.loading
        }
      };
      
      saveChanges();
    }
  }, [saved, loading, teamId, saveFormation, preset, starters, subs]); // Added starters, subs to dependency array for completeness
  
  // Add a new useEffect for manual saving after player swaps
  useEffect(() => {
    if (swappingPlayers.length > 0) {
      console.log("Formation container: Players are being swapped, will save once complete", swappingPlayers);
      // After the swap animation completes, ensure changes are saved
      const saveTimer = setTimeout(() => {
        console.log("Formation container: Swap animation complete, ensuring changes are saved");
        // Force a save after swapping animation completes
        saveFormation().catch(err => {
          console.error("Formation container: Failed to save after swap animation:", err);
        });
      }, 600); // Slightly longer than the animation duration (500ms)
      
      return () => clearTimeout(saveTimer);
    }
  }, [swappingPlayers, saveFormation]);
  
  // Add an additional useEffect to ensure changes are saved when exiting the page
  useEffect(() => {
    // Create a function to force save on unmount or page leave
    const handlePageLeave = () => {
      if (!saved && !loading && teamId) {
        console.log("Formation container: Page exit detected, forcing save");
        // Force a synchronous save attempt
        try {
          useFormationStore.getState().forceSave();
        } catch (error) {
          console.error("Formation container: Failed to save on page exit:", error);
        }
      }
    };

    // Add a beforeunload event to catch page reloads/navigation
    window.addEventListener('beforeunload', handlePageLeave);
    
    // Clean up
    return () => {
      window.removeEventListener('beforeunload', handlePageLeave);
      // Also try to save when component unmounts
      handlePageLeave();
    };
  }, [saved, loading, teamId]);
  
  // Periodic auto-save to prevent data loss
  useEffect(() => {
    // Auto-save every 15 seconds if there are unsaved changes
    const autoSaveInterval = setInterval(() => {
      if (!saved && !loading && teamId) {
        console.log("Formation container: Auto-save triggered");
        saveFormation().catch(err => {
          console.error("Formation container: Auto-save failed:", err);
        });
      }
    }, 15000);
    
    return () => clearInterval(autoSaveInterval);
  }, [saved, loading, teamId, saveFormation]);
  
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
  
  // Handle player drop or swap with utility function
  const onPlayerDropOrSwap = (draggedItemInfo, dropTargetInfo) => {
    handlePlayerDropOrSwap(
      draggedItemInfo, 
      dropTargetInfo, 
      isManager,
      movePlayerToPosition,
      movePlayerToSubSlot,
      swapPlayersInFormation,
      moveStarterToSubsGeneral
    );
  };
  
  // Handle preset changes with utility function
  const onPresetChange = (newPreset) => {
    handlePresetChange(newPreset, changePreset, setShowEditTab);
  };
  
  // Handle player selection with utility function
  const onPlayerSelect = (playerId, isStarter, positionId, indexInSubs) => {
    handlePlayerSelect(
      playerId, 
      isStarter, 
      positionId, 
      indexInSubs, 
      selectedPlayer, 
      swappingPlayers, 
      setSelectedPlayer, 
      setSwappingPlayers, 
      swapPlayersInFormation,
      isManager
    );
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
  
  // Handle export button click
  const handleExportClick = () => {
    if (containerRef.current) {
      // Pass the DOM element directly to exportAsPNG
      exportAsPNG(containerRef.current);
    }
  };
  
  console.log("Render FormationContainer", { starters: starters.length, subs: subs.length, isManager });
  
  // Get position markers and placeholders using utility functions
  const positionMarkers = createPositionMarkers(PRESETS, preset, dimensions);
  const positionPlaceholders = isManager ? createPositionPlaceholders(PRESETS, preset, starters, dimensions, isManager) : [];
  
  // Determine save status message using store's `loading` state
  const saveStatusText = loading ? "Saving..." : (saved ? "Saved" : "Unsaved Changes");
  const saveStatusClass = `save-status ${loading ? 'saving' : (saved ? 'saved' : 'unsaved')}`;
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="formation-container" style={{ backgroundColor: '#1a202c', padding: '1rem', borderRadius: '0.5rem' }}>
        {showEditTab ? (
          <Edit 
            onSelectPreset={onPresetChange} 
            currentPreset={preset}
            onClose={() => setShowEditTab(false)}
            isManager={isManager}
          />
        ) : (
          <>
            <div className="formation-header-controls">
              <div className={saveStatusClass}>
                <span className="save-status-icon">
                  {loading ? ( // Use store's `loading` state
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="spinner">
                      <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                  ) : saved ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                    </svg>
                  )}
                </span>
                {saveStatusText}
              </div>
              
              <div className="controls-right">
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
                
                <button 
                  className="export-formation-button"
                  onClick={handleExportClick}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                  </svg>
                  Export
                </button>
              </div>
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
              <div className="formation-label">
                <span className="preset-label">Formation:</span>
                <span className="preset-value">{preset}</span>
              </div>
              
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
                
                {/* Render position markers */}
                {positionMarkers?.map(marker => (
                  <PositionMarker
                    key={marker.key}
                    x={marker.x}
                    y={marker.y}
                    label={marker.label}
                  />
                ))}
                
                {/* Position placeholders */}
                {positionPlaceholders?.map(placeholder => (
                  <PositionPlaceholder
                    key={placeholder.key}
                    x={placeholder.x}
                    y={placeholder.y}
                    label={placeholder.label}
                    positionId={placeholder.positionId}
                    isManager={placeholder.isManager}
                  />
                ))}
                
                {/* Player chips */}
                {Array.isArray(starters) ? starters.map(player => {
                  if (!player) return null;
                  const pixelPos = normalizedToPixel(player.xNorm, player.yNorm, dimensions);
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
                      onDropOrSwap={onPlayerDropOrSwap}
                      isPlaceholder={false}
                      positionId={player.positionId}
                      indexInSubs={null}
                      isSelected={selectedPlayer?.id === player.id}
                      onSelect={onPlayerSelect}
                      isSwapping={isPlayerSwapping(player.id, swappingPlayers)}
                    />
                  );
                }) : null}
              </div>
            </div>
            
            <SubsStrip 
              subs={subs} 
              draggable={isManager && swappingPlayers.length === 0}
              onDropOrSwap={onPlayerDropOrSwap}
              showPlaceholders={isManager && subs.length < 7}
              isManager={isManager}
              selectedPlayer={selectedPlayer}
              onPlayerSelect={onPlayerSelect}
              swappingPlayers={swappingPlayers}
            />
          </>
        )}
      </div>
    </DndProvider>
  );
};

export default FormationContainer;
