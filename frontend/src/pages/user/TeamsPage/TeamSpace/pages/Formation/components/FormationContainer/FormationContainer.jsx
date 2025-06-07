import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  const containerRef = useRef(null);
  const initializationRef = useRef(new Set());
  const lastTeamIdRef = useRef(null);
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
    saveError,
    pendingChanges,
    mapPlayersToPositions,
    movePlayerToPosition,
    movePlayerToSubSlot,
    swapPlayersInFormation,
    moveStarterToSubsGeneral,
    changePreset,
    exportAsPNG,
    saveFormation,
    saveWithRetry,
    clearSaveError,
  } = useFormationStore();
  
  // Get PRESETS from the store
  const { PRESETS } = useFormationStore.getState();
  
  // Add state for tracking selected players and animations
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [swappingPlayers, setSwappingPlayers] = useState([]);
  const [managerPreferredFormation, setManagerPreferredFormation] = useState(null);
  
  // Memoize store properties to prevent unnecessary re-renders
  const storeData = useMemo(() => ({
    starters: starters || [],
    subs: subs || [],
    preset,
    loading,
    saved,
    saveError,
    pendingChanges
  }), [starters, subs, preset, loading, saved, saveError, pendingChanges]);

  // Initialize formation data only when teamId actually changes
  useEffect(() => {
    if (!teamId || teamId === lastTeamIdRef.current) {
      console.log('FormationContainer: Skipping initialization - same team ID or no team ID');
      return;
    }

    const initKey = `${teamId}_${Date.now()}`;
    
    if (initializationRef.current.has(teamId)) {
      console.log('Initialization already in progress for team', teamId);
      return;
    }

    console.log('Initializing formation data', { teamId });
    initializationRef.current.add(teamId);
    lastTeamIdRef.current = teamId;

    const initializeFormation = async () => {
      try {
        await init(teamId);
      } finally {
        // Allow re-initialization after a delay
        setTimeout(() => {
          initializationRef.current.delete(teamId);
        }, 1000);
      }
    };

    initializeFormation();
  }, [teamId, init]); // Only depend on teamId and init function

  // Only fetch managers when needed and prevent duplicate calls
  useEffect(() => {
    let isMounted = true;
    
    if (!teamId || !isManager) return;

    const fetchManagers = async () => {
      try {
        const response = await apiClient.get(`/teams/${teamId}/managers`);
        
        if (isMounted && response?.managers?.length > 0) {
          const managerData = response.managers[0];
          const preferredFormation = managerData?.Manager?.preferredFormation;
          
          if (preferredFormation && preferredFormation !== preset) {
            console.log('Using manager\'s preferred formation:', preferredFormation);
            changePreset(preferredFormation);
          }
        }
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    // Debounce the manager fetch to prevent multiple calls
    const timeoutId = setTimeout(fetchManagers, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [teamId, isManager, preset, changePreset]); // Include preset to prevent unnecessary calls

  // Save changes when formation is updated
  useEffect(() => {
    // Use store's `loading` state to prevent concurrent saves triggered by this effect
    if (!saved && !loading && teamId && pendingChanges) {
      console.log("🔄 FormationContainer: Auto-save triggered", {
        saved,
        loading,
        teamId,
        pendingChanges,
        startersLength: starters.length,
        subsLength: subs.length,
        preset
      });
      
      const saveChanges = async () => {
        try {
          console.log("📤 FormationContainer: Calling saveWithRetry...");
          
          const result = await saveWithRetry(); // Use enhanced save with retry
          
          if (result && result.success) {
            console.log("✅ FormationContainer: Formation saved successfully");
          } else {
            console.error("❌ FormationContainer: Error saving formation:", 
              result ? result.error : "No result returned from save operation");
          }
        } catch (error) {
          console.error("💥 FormationContainer: Exception during save:", error);
        }
      };
      
      saveChanges();
    } else {
      console.log("⏸️ FormationContainer: Auto-save conditions not met", {
        saved,
        loading,
        teamId: !!teamId,
        pendingChanges,
        reason: !saved ? 'not saved' : 
                loading ? 'loading' : 
                !teamId ? 'no teamId' : 
                !pendingChanges ? 'no pending changes' : 'unknown'
      });
    }
  }, [saved, loading, teamId, saveWithRetry, pendingChanges]); // Added pendingChanges to dependency array
  
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
  
  console.log('Render FormationContainer', { 
    starters: starters?.length || 0, 
    subs: subs?.length || 0, 
    isManager,
    teamId,
    saved,
    loading
  });
  
  // Get position markers and placeholders using utility functions
  const positionMarkers = createPositionMarkers(PRESETS, preset, dimensions);
  const positionPlaceholders = isManager ? createPositionPlaceholders(PRESETS, preset, starters, dimensions, isManager) : [];
  
  // Determine save status message and handle errors
  let saveStatusText = "Saved";
  let saveStatusClass = "save-status saved";
  
  if (loading) {
    saveStatusText = "Saving...";
    saveStatusClass = "save-status saving";
  } else if (saveError) {
    saveStatusText = "Save Failed";
    saveStatusClass = "save-status error";
  } else if (!saved || pendingChanges) {
    saveStatusText = "Unsaved Changes";
    saveStatusClass = "save-status unsaved";
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="formation-container" style={{ backgroundColor: '#1a202c', padding: '0 0rem 0rem 1rem', borderRadius: '0.5rem' }}>
        {showEditTab ? (
          <Edit 
            onSelectPreset={onPresetChange} 
            currentPreset={preset}
            onClose={() => setShowEditTab(false)}
            isManager={isManager}
          />
        ) : (
          <>
            <div className="formation-header">
              {/* Removed formation preset display */}
              
              <div className="formation-actions">
                <div className={saveStatusClass}>
                  <span className="save-status-icon">
                    {loading ? ( 
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="spinner">
                        <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                      </svg>
                    ) : saveError ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="error-icon">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                      </svg>
                    ) : saved && !pendingChanges ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="attention-icon">
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.553.553 0 0 1-1.1 0L7.1 4.995z"/>
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      </svg>
                    )}
                  </span>
                  <span className="save-status-text">{saveStatusText}</span>
                  {saveError && (
                    <span className="save-error-details" title={saveError}>
                      {saveError.includes('401') || saveError.includes('403') ? 'Permission Denied' : 'Connection Error'}
                    </span>
                  )}
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
                
                {/* Show retry button when there's an error */}
                {saveError && (
                  <button 
                    className="retry-save-button" 
                    onClick={() => {
                      clearSaveError();
                      saveWithRetry();
                    }}
                    title="Retry saving formation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                    Retry
                  </button>
                )}
                
                {/* Show save now button for unsaved changes */}
                {((!saved && !loading) || pendingChanges) && !saveError && (
                  <button 
                    className="save-now-button" 
                    onClick={() => saveWithRetry()}
                    title="Save changes now"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 8.293V2a2 2 0 0 1 2-2H14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h2.5a.5.5 0 0 1 0 1H2z"/>
                    </svg>
                    Save Now
                  </button>
                )}
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
                <span className="preset-value">{preset}</span>
              </div>
              
              <div 
                ref={pitchRef}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '625px', // Fixed height instead of dynamic calculation
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
                      y={pixelPos.y} // Remove the -15px offset since markers are now positioned lower
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
