import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Import components
import { useFormationContainer } from './hooks/useFormationContainer';
import SaveStatus from './components/SaveStatus';
import FormationControls from './components/FormationControls';
import FormationPitch from './components/FormationPitch';
import { SubsStrip } from './components';
import Edit from '../Tabs/Edit/Edit';

// Import utilities
import { createPositionPlaceholders, createPositionMarkers } from './utils/positionUtils';
import { handlePlayerDropOrSwap } from './utils/eventHandlers';

// Import styles
import '../FormationBoard/styles/index.css';
import './styles/index.css';

const FormationContainer = ({ 
  teamId, 
  team,
  isManager = false,
  isPlayer = false,
  viewMode = 'viewer',
  players = [],
  onPlayersUpdate
}) => {
  // Use custom hook for logic
  const {
    storeData,
    preset,
    loading,
    saved,
    saveError,
    pendingChanges,
    PRESETS,
    selectedPlayer,
    swappingPlayers,
    showEditTab,
    dimensions,
    containerRef,
    pitchRef,
    setSelectedPlayer,
    setSwappingPlayers,
    setShowEditTab,
    movePlayerToPosition,
    movePlayerToSubSlot,
    swapPlayersInFormation,
    moveStarterToSubsGeneral,
    handlePresetChange,
    handlePlayerSelection,
    handleExport,
    handleManualSave
  } = useFormationContainer({ teamId, isManager, players });

  // Event handlers
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

  const onPresetChange = (newPreset) => {
    handlePresetChange(newPreset);
  };

  const handleRetryFailedSave = () => {
    handleManualSave();
  };

  // Get position markers and placeholders
  const positionMarkers = createPositionMarkers(PRESETS, preset, dimensions);
  const positionPlaceholders = isManager ? createPositionPlaceholders(PRESETS, preset, storeData.starters, dimensions, isManager) : [];

  // Show loading state
  if (loading && (!storeData.starters || storeData.starters.length === 0)) {
    return (
      <div className="formation-container-loading">
        <div className="loader"></div>
        <p>Loading formation...</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="formation-container">
        {/* Save Status Bar */}
        <SaveStatus
          loading={loading}
          saved={saved}
          saveError={saveError}
          pendingChanges={pendingChanges}
          onRetry={handleRetryFailedSave}
          onManualSave={handleManualSave}
          isManager={isManager}
        />

        {/* Formation Controls */}
        <FormationControls
          preset={preset}
          isManager={isManager}
          onEditClick={() => setShowEditTab(true)}
          onExportClick={handleExport}
        />

        {/* Preset Selector */}
        {showEditTab && isManager && (
          <Edit
            onSelectPreset={onPresetChange}
            currentPreset={preset}
            onClose={() => setShowEditTab(false)}
            isManager={isManager}
          />
        )}

        {/* Main Formation Area */}
        {!showEditTab && (
          <>
            <div 
              ref={containerRef}
              style={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: '0.375rem',
                position: 'relative',
                backgroundColor: '#006341'
              }}
            >
              <FormationPitch
                pitchRef={pitchRef}
                dimensions={dimensions}
                preset={preset}
                starters={storeData.starters}
                positionMarkers={positionMarkers}
                positionPlaceholders={positionPlaceholders}
                isManager={isManager}
                selectedPlayer={selectedPlayer}
                swappingPlayers={swappingPlayers}
                onPlayerSelect={handlePlayerSelection}
                onPlayerDropOrSwap={onPlayerDropOrSwap}
              />
            </div>

            <SubsStrip 
              subs={storeData.subs} 
              draggable={isManager && swappingPlayers.length === 0}
              onDropOrSwap={onPlayerDropOrSwap}
              showPlaceholders={isManager && storeData.subs.length < 7}
              isManager={isManager}
              selectedPlayer={selectedPlayer}
              onPlayerSelect={handlePlayerSelection}
              swappingPlayers={swappingPlayers}
            />
          </>
        )}

        {/* Debug Information (Development Mode) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="formation-debug">
            <details>
              <summary>Debug Info</summary>
              <div className="debug-content">
                <p><strong>Team:</strong> {team?.name} (ID: {teamId})</p>
                <p><strong>Players:</strong> {players.length}</p>
                <p><strong>Starters:</strong> {storeData.starters?.length || 0}</p>
                <p><strong>Subs:</strong> {storeData.subs?.length || 0}</p>
                <p><strong>Preset:</strong> {preset}</p>
                <p><strong>View Mode:</strong> {viewMode}</p>
                <p><strong>Is Manager:</strong> {isManager ? 'Yes' : 'No'}</p>
                <p><strong>Pending Changes:</strong> {pendingChanges ? 'Yes' : 'No'}</p>
              </div>
            </details>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default FormationContainer;