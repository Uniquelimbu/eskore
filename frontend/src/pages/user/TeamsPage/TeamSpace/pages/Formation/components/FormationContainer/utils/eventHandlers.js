/**
 * Handle player selection with animation
 */
export const handlePlayerSelect = (playerId, isStarter, positionId, indexInSubs, selectedPlayer, swappingPlayers, setSelectedPlayer, setSwappingPlayers, swapPlayersInFormation, isManager) => {
  if (!isManager || swappingPlayers.length > 0) return; // Prevent selection while animating

  console.log('Player selected:', playerId, 'Current selected:', selectedPlayer?.id);

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
    console.log('Swapping players:', selectedPlayer.id, playerId);
    
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

/**
 * Handle player drag and drop operations
 */
export const handlePlayerDropOrSwap = (draggedItemInfo, dropTargetInfo, isManager, movePlayerToPosition, movePlayerToSubSlot, swapPlayersInFormation, moveStarterToSubsGeneral) => {
  // Skip if not manager
  if (!isManager) return; 

  const { id: draggedPlayerId, isStarterAtDragStart, originalPositionId, originalSubIndex } = draggedItemInfo;

  console.log('Player dropped:', { 
    draggedPlayerId, 
    targetType: dropTargetInfo.type,
    isStarterAtDragStart, 
    originalPositionId
  });

  if (dropTargetInfo.type === 'positionPlaceholder') {
    const targetPositionId = dropTargetInfo.positionId;
    console.log('Moving player to position:', targetPositionId);
    movePlayerToPosition(draggedPlayerId, targetPositionId, isStarterAtDragStart, originalPositionId, originalSubIndex);
  } else if (dropTargetInfo.type === 'subSlot') {
    const targetSubIndex = dropTargetInfo.index;
    console.log('Moving player to sub slot:', targetSubIndex);
    movePlayerToSubSlot(draggedPlayerId, targetSubIndex, isStarterAtDragStart, originalPositionId, originalSubIndex);
  } else if (dropTargetInfo.type === 'playerSwapTarget') {
    const targetPlayerId = dropTargetInfo.targetPlayerId;
    console.log('Swapping players:', draggedPlayerId, targetPlayerId);
    swapPlayersInFormation(draggedPlayerId, targetPlayerId);
  } else if (dropTargetInfo.type === 'subsStrip') {
    // Player (likely a starter) was dropped onto the general subs bench area
    console.log('Moving starter to subs strip:', draggedPlayerId);
    moveStarterToSubsGeneral(draggedPlayerId, originalPositionId);
  }
};

/**
 * Handle formation preset change 
 */
export const handlePresetChange = (newPreset, changePreset, setShowEditTab) => {
  changePreset(newPreset);
  setShowEditTab(false);
};
