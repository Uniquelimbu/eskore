import { PRESETS } from './constants';
import { findPlayerAndLocation } from './utils';

/**
 * Handle player drag within the formation pitch
 */
export const handleDrag = (id, newX, newY, targetType, get, set) => {
  const { starters, subs, preset } = get();
  
  // Find the player's location (starter or sub)
  const isStarter = starters.some(s => s.id === id);
  
  if (isStarter) {
    const starterIndex = starters.findIndex(s => s.id === id);
    if (starterIndex === -1) return;
    
    const newStarters = [...starters];
    const newSubs = [...subs];
    
    if (targetType === 'pitch') {
      // Update position on pitch - find closest position in the formation
      const currentPreset = PRESETS[preset];
      let closestPos = null;
      let minDistance = Infinity;
      
      // Find closest position from the current formation
      currentPreset.forEach(pos => {
        // Skip if it's the player's current position
        if (pos.id === starters[starterIndex].id) return;
        
        // Calculate distance to this position
        const distance = Math.sqrt(
          Math.pow(newX - pos.xNorm, 2) + 
          Math.pow(newY - pos.yNorm, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestPos = pos;
        }
      });
      
      // If a close position was found, use its coordinates for snapping
      if (closestPos && minDistance < 20) { // Only snap if reasonably close
        newX = closestPos.xNorm;
        newY = closestPos.yNorm;
      }
      
      // Update the position
      newStarters[starterIndex] = {
        ...newStarters[starterIndex],
        xNorm: newX,
        yNorm: newY
      };
      
      set({ starters: newStarters, saved: false });
    } else if (targetType === 'subs') {
      // Move starter to subs - find an empty slot
      const starter = starters[starterIndex];
      
      // Add to subs with the next available position
      newSubs.push({
        id: starter.id,
        label: starter.label,
        position: starter.position || starter.label,
        playerId: starter.playerId,
        jerseyNumber: starter.jerseyNumber,
        playerName: starter.playerName
      });
      
      // Remove from starters
      newStarters.splice(starterIndex, 1);
      
      set({ starters: newStarters, subs: newSubs, saved: false });
    }
  } else {
    // Moving a sub to starters
    const subIndex = subs.findIndex(s => s.id === id);
    if (subIndex === -1) return;
    
    const newStarters = [...starters];
    const newSubs = [...subs];
    
    if (targetType === 'pitch' || targetType === 'starters') {
      const sub = subs[subIndex];
      
      // Find an empty position in the formation
      const currentPreset = PRESETS[preset];
      const usedPositions = new Set(starters.map(s => s.id));
      const emptyPositions = currentPreset.filter(pos => !usedPositions.has(pos.id));
      
      if (emptyPositions.length > 0) {
        // Use the first available position
        const pos = emptyPositions[0];
        
        // Add to starters
        newStarters.push({
          id: sub.id,
          label: sub.label,
          position: sub.position || sub.label,
          xNorm: pos.xNorm,
          yNorm: pos.yNorm,
          playerId: sub.playerId,
          jerseyNumber: sub.jerseyNumber,
          playerName: sub.playerName
        });
        
        // Remove from subs
        newSubs.splice(subIndex, 1);
        
        set({ starters: newStarters, subs: newSubs, saved: false });
      }
    }
  }
  
  // Save the updated formation
  get().saveFormation();
};

/**
 * Move a player to a specific position on the pitch
 */
export const movePlayerToPosition = (draggedPlayerId, targetPositionId, wasStarter, originalPosId, originalSubIdx) => (state, set) => {
  let { starters, subs } = state;
  starters = [...starters]; subs = [...subs];

  const draggedPlayerLocation = findPlayerAndLocation(draggedPlayerId, starters, subs);
  if (!draggedPlayerLocation) { 
    console.error("Dragged player not found in store"); 
    return {}; 
  }

  // Remove dragged player from original list    
  draggedPlayerLocation.list.splice(draggedPlayerLocation.index, 1);
  let playerToMove = { ...draggedPlayerLocation.player };

  // Find if target position is occupied
  const occupantLocation = findPlayerAndLocation(
    starters.find(p => p.positionId === targetPositionId)?.id, 
    starters, 
    []
  );
  
  // Update playerToMove for its new pitch position
  const targetPosData = state.PRESETS[state.preset].find(p => p.id === targetPositionId);
  playerToMove.isStarter = true;
  playerToMove.positionId = targetPositionId;
  playerToMove.xNorm = targetPosData.xNorm;
  playerToMove.yNorm = targetPosData.yNorm;
  playerToMove.label = targetPosData.label;
  
  starters.push(playerToMove);

  if (occupantLocation) {
    const occupant = occupantLocation.player;
    starters.splice(occupantLocation.index, 1);

    // Move occupant to where dragged player came from OR to subs
    if (wasStarter && originalPosId && originalPosId !== targetPositionId) {
      // Move occupant to dragged player's original starter slot
      const originalPosData = state.PRESETS[state.preset].find(p => p.id === originalPosId);
      occupant.isStarter = true;
      occupant.positionId = originalPosId;
      occupant.xNorm = originalPosData.xNorm;
      occupant.yNorm = originalPosData.yNorm;
      occupant.label = originalPosData.label;
      starters.push(occupant);
    } else {
      // Default: move occupant to subs
      occupant.isStarter = false; 
      occupant.positionId = null;
      subs.push(occupant);
    }
  }
  
  return { starters, subs, saved: false };
};

/**
 * Move a player to a specific sub position
 */
export const movePlayerToSubSlot = (draggedPlayerId, targetSubIndex, wasStarter, originalPosId, originalSubIdx) => (state, set) => {
  let { starters, subs } = state;
  starters = [...starters]; subs = [...subs];

  const draggedPlayerLocation = findPlayerAndLocation(draggedPlayerId, starters, subs);
  if (!draggedPlayerLocation) { 
    console.error("Dragged player not found for sub move"); 
    return {}; 
  }

  draggedPlayerLocation.list.splice(draggedPlayerLocation.index, 1);
  let playerToMove = { ...draggedPlayerLocation.player, isStarter: false, positionId: null };
  
  let occupant = null;
  if (targetSubIndex >= 0 && targetSubIndex < subs.length) {
    occupant = subs[targetSubIndex];
    subs.splice(targetSubIndex, 0, playerToMove);
    
    if(occupant && occupant.id === playerToMove.id) {
      occupant = null;
    } else if (occupant) {
      subs = subs.filter(p => p.id !== occupant.id || p === playerToMove);
    }
  } else {
    subs.push(playerToMove);
  }
  
  if (occupant) {
    if (!wasStarter && originalSubIdx !== null && originalSubIdx !== targetSubIndex) {
      // Move occupant to dragged player's original sub slot
      subs.splice(originalSubIdx, 0, occupant);
    } else {
      // Try to move occupant to an empty starter slot or add to subs
      const emptyStarterSlot = state.PRESETS[state.preset].find(pos => !starters.some(s => s.positionId === pos.id));
      if (emptyStarterSlot) {
        occupant.isStarter = true; 
        occupant.positionId = emptyStarterSlot.id;
        occupant.xNorm = emptyStarterSlot.xNorm; 
        occupant.yNorm = emptyStarterSlot.yNorm; 
        occupant.label = emptyStarterSlot.label;
        starters.push(occupant);
      } else {
        subs.push(occupant);
      }
    }
  }
  
  return { starters, subs, saved: false };
};

/**
 * Move a starter to the subs bench
 */
export const moveStarterToSubsGeneral = (draggedPlayerId, originalPositionId) => (state, set) => {
  let { starters, subs } = state;
  starters = [...starters]; subs = [...subs];

  const starterIndex = starters.findIndex(p => p.id === draggedPlayerId);
  if (starterIndex === -1) { 
    console.error("Starter to move to subs not found"); 
    return {}; 
  }

  const playerToMove = starters.splice(starterIndex, 1)[0];
  playerToMove.isStarter = false; 
  playerToMove.positionId = null;
  
  subs.push(playerToMove);

  return { starters, subs, saved: false };
};

/**
 * Swap two players on the field or bench
 */
export const swapPlayersInFormation = (player1Id, player2Id) => (state, set) => {
  let { starters, subs } = state;
  starters = [...starters]; subs = [...subs];

  const p1Loc = findPlayerAndLocation(player1Id, starters, subs);
  const p2Loc = findPlayerAndLocation(player2Id, starters, subs);

  if (!p1Loc || !p2Loc) { 
    console.error("One or both players for swap not found"); 
    return {}; 
  }

  const p1 = { ...p1Loc.player }; 
  const p2 = { ...p2Loc.player };

  // Case 1: Both Starters
  if (p1Loc.isStarter && p2Loc.isStarter) {
    starters[p1Loc.index] = { 
      ...p2, 
      positionId: p1.positionId, 
      xNorm: p1.xNorm, 
      yNorm: p1.yNorm, 
      label: p1.label, 
      isStarter: true 
    };
    
    starters[p2Loc.index] = { 
      ...p1, 
      positionId: p2.positionId, 
      xNorm: p2.xNorm, 
      yNorm: p2.yNorm, 
      label: p2.label, 
      isStarter: true 
    };
  }
  // Case 2: Both Subs
  else if (!p1Loc.isStarter && !p2Loc.isStarter) {
    subs[p1Loc.index] = p2;
    subs[p2Loc.index] = p1;
  }
  // Case 3: One Starter, One Sub
  else {
    const starter = p1Loc.isStarter ? p1 : p2;
    const sub = p1Loc.isStarter ? p2 : p1;
    const starterIdx = p1Loc.isStarter ? p1Loc.index : p2Loc.index;
    const subIdx = p1Loc.isStarter ? p2Loc.index : p1Loc.index;

    // Sub becomes starter
    const newStarter = { 
      ...sub, 
      isStarter: true, 
      positionId: starter.positionId, 
      xNorm: starter.xNorm, 
      yNorm: starter.yNorm, 
      label: starter.label 
    };
    starters[starterIdx] = newStarter;
    
    // Starter becomes sub
    const newSub = { 
      ...starter, 
      isStarter: false, 
      positionId: null 
    };
    subs[subIdx] = newSub;
  }
  
  return { starters, subs, saved: false };
};

/**
 * Swap two players (enhanced to handle all cases)
 */
export const swapPlayers = (id1, id2, bothStarters, get, set) => {
  const { starters, subs } = get();
  
  // Find all the relevant indices
  const starter1Index = starters.findIndex(s => s.id === id1);
  const starter2Index = starters.findIndex(s => s.id === id2);
  const sub1Index = subs.findIndex(s => s.id === id1);
  const sub2Index = subs.findIndex(s => s.id === id2);
  
  // Skip any operation involving placeholder subs
  if ((sub1Index !== -1 && subs[sub1Index].isPlaceholder) ||
      (sub2Index !== -1 && subs[sub2Index].isPlaceholder)) {
    return;
  }
  
  const newStarters = [...starters];
  const newSubs = [...subs];
  
  if (starter1Index !== -1 && starter2Index !== -1) {
    // Both are starters - swap positions
    const pos1 = { xNorm: newStarters[starter1Index].xNorm, yNorm: newStarters[starter1Index].yNorm };
    const pos2 = { xNorm: newStarters[starter2Index].xNorm, yNorm: newStarters[starter2Index].yNorm };
    
    newStarters[starter1Index] = { ...newStarters[starter1Index], xNorm: pos2.xNorm, yNorm: pos2.yNorm };
    newStarters[starter2Index] = { ...newStarters[starter2Index], xNorm: pos1.xNorm, yNorm: pos1.yNorm };
    
    set({ starters: newStarters, saved: false });
  } else if (starter1Index !== -1 && sub2Index !== -1) {
    // Starter and sub - swap them
    const starter = starters[starter1Index];
    const sub = subs[sub2Index];
    
    // Move sub to starter position
    newStarters[starter1Index] = {
      id: sub.id,
      label: sub.label,
      position: sub.position || sub.label,
      xNorm: starter.xNorm,
      yNorm: starter.yNorm,
      playerId: sub.playerId,
      jerseyNumber: sub.jerseyNumber,
      playerName: sub.playerName
    };
    
    // Move starter to subs
    newSubs[sub2Index] = {
      id: starter.id,
      label: starter.label,
      position: starter.position || starter.label,
      playerId: starter.playerId,
      jerseyNumber: starter.jerseyNumber,
      playerName: starter.playerName
    };
    
    set({ starters: newStarters, subs: newSubs, saved: false });
  } else if (starter2Index !== -1 && sub1Index !== -1) {
    // Sub and starter - swap them
    const sub = subs[sub1Index];
    const starter = starters[starter2Index];
    
    // Move sub to starter position
    newStarters[starter2Index] = {
      id: sub.id,
      label: sub.label,
      position: sub.position || sub.label,
      xNorm: starter.xNorm,
      yNorm: starter.yNorm,
      playerId: sub.playerId,
      jerseyNumber: sub.jerseyNumber,
      playerName: sub.playerName
    };
    
    // Move starter to subs
    newSubs[sub1Index] = {
      id: starter.id,
      label: starter.label,
      position: starter.position || starter.label,
      playerId: starter.playerId,
      jerseyNumber: starter.jerseyNumber,
      playerName: starter.playerName
    };
    
    set({ starters: newStarters, subs: newSubs, saved: false });
  } else if (sub1Index !== -1 && sub2Index !== -1) {
    // Both are subs - swap positions in the subs array
    const temp = newSubs[sub1Index];
    newSubs[sub1Index] = newSubs[sub2Index];
    newSubs[sub2Index] = temp;
    
    set({ subs: newSubs, saved: false });
  }
  
  // Save the updated formation
  get().saveFormation();
};
