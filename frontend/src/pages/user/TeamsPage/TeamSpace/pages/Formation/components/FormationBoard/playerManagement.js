import { PRESETS } from './constants';
import { shuffle } from './utils';

/**
 * Generate default starters based on a preset
 */
export const generateDefaultStarters = (preset) => {
  return PRESETS[preset].map((pos, index) => {
    return {
      ...pos,
      position: pos.label,
      jerseyNumber: String(index + 1), // Players 1-11
      playerName: `Player ${index + 1}`,
      playerId: null,
      positionId: pos.id
    };
  });
};

/**
 * Intelligently assign real players to formation positions based on their position
 */
export const assignPlayersToFormation = (players, presetName, get, set) => {
  if (!players || !players.length) return;

  const presetPositions = PRESETS[presetName || '4-3-3'];
  const playersToAssign = [...players]; // Create a copy we can modify
  
  // 1. Categorize positions in the formation
  const positionCategories = {
    GK: presetPositions.filter(p => p.label === 'GK').map(p => p.id),
    DF: presetPositions.filter(p => ['LB', 'CB', 'RB'].some(label => p.label.includes(label))).map(p => p.id),
    MF: presetPositions.filter(p => ['CM', 'CDM', 'CAM', 'LM', 'RM'].some(label => p.label.includes(label))).map(p => p.id),
    FW: presetPositions.filter(p => ['ST', 'CF', 'LW', 'RW'].some(label => p.label.includes(label))).map(p => p.id)
  };
  
  // 2. Categorize players based on their position
  const playerCategories = {
    GK: playersToAssign.filter(p => p.position === 'GK' || p.preferredPosition === 'GK'),
    DF: playersToAssign.filter(p => ['LB', 'CB', 'RB'].some(pos => (p.position || '').includes(pos) || (p.preferredPosition || '').includes(pos))),
    MF: playersToAssign.filter(p => ['CM', 'CDM', 'CAM', 'LM', 'RM'].some(pos => (p.position || '').includes(pos) || (p.preferredPosition || '').includes(pos))),
    FW: playersToAssign.filter(p => ['ST', 'CF', 'LW', 'RW'].some(pos => (p.position || '').includes(pos) || (p.preferredPosition || '').includes(pos))),
    OTHER: [] // For players without a specific position
  };
  
  // Players not matched to a category go to OTHER
  playerCategories.OTHER = playersToAssign.filter(p => 
    !playerCategories.GK.includes(p) && 
    !playerCategories.DF.includes(p) && 
    !playerCategories.MF.includes(p) && 
    !playerCategories.FW.includes(p)
  );
  
  // 3. Shuffle each category 
  Object.keys(playerCategories).forEach(key => {
    playerCategories[key] = shuffle(playerCategories[key]);
  });
  
  // 4. Assign players to positions based on categories
  const newStarters = Array(presetPositions.length).fill(null);
  const assignedPlayerIds = new Set();
  
  // Process each position category
  const assignPositionCategory = (positionIds, playerCategory, otherPlayers) => {
    for (const posId of positionIds) {
      const player = playerCategory.shift() || otherPlayers.shift();
      if (player && !assignedPlayerIds.has(player.id)) {
        const posIndex = presetPositions.findIndex(p => p.id === posId);
        if (posIndex !== -1) {
          const pos = presetPositions[posIndex];
          newStarters[posIndex] = {
            ...pos,
            position: pos.label,
            playerId: player.id,
            jerseyNumber: player.jerseyNumber || '',
            playerName: player.lastName || player.firstName || player.name || '',
            positionId: pos.id
          };
          assignedPlayerIds.add(player.id);
        }
      }
    }
  };
  
  // Assign players by position category
  assignPositionCategory(positionCategories.GK, playerCategories.GK, playerCategories.OTHER);
  assignPositionCategory(positionCategories.DF, playerCategories.DF, playerCategories.OTHER);
  assignPositionCategory(positionCategories.MF, playerCategories.MF, playerCategories.OTHER);
  assignPositionCategory(positionCategories.FW, playerCategories.FW, playerCategories.OTHER);
  
  // Fill any remaining positions with dummy players
  const finalStarters = newStarters.map((starter, index) => {
    if (starter === null) {
      const pos = presetPositions[index];
      return {
        ...pos,
        position: pos.label,
        jerseyNumber: String(index + 1),
        playerName: `Player ${index + 1}`,
        playerId: null,
        positionId: pos.id
      };
    }
    return starter;
  });
  
  // 5. Assign remaining players to subs - exactly 7 subs
  const remainingPlayers = playersToAssign.filter(p => !assignedPlayerIds.has(p.id));
  const newSubs = remainingPlayers.slice(0, 7).map((player, index) => {
    return {
      id: `sub-${index + 1}`,
      label: player.position || player.preferredPosition || 'SUB',
      position: player.position || player.preferredPosition || 'SUB',
      playerId: player.id,
      jerseyNumber: player.jerseyNumber || String(index + 12), // Start from 12
      playerName: player.lastName || player.firstName || player.name || `Sub ${index + 1}`
    };
  });
  
  // Fill remaining sub slots with dummy players - ensure exactly 7 total
  while (newSubs.length < 7) {
    const index = newSubs.length;
    newSubs.push({
      id: `dummy-${index + 12}`,
      label: 'SUB',
      position: 'SUB',
      jerseyNumber: String(index + 12),
      playerName: `Player ${index + 12}`,
      playerId: null
    });
  }
  
  // Update state and save
  set({ 
    starters: finalStarters, 
    subs: newSubs,
    saved: false 
  });
  
  // Save the new assignments
  get().saveFormation();
};

/**
 * Map players to their existing positions or intelligently assign if none exist
 */
export const mapPlayersToPositions = (players, get, set) => {
  const { starters, subs, preset } = get(); // Add preset to destructuring
  
  console.log('Mapping players to positions:', players.length, 'players available');
  
  // Create a player map for quick lookup
  const playerMap = {};
  players.forEach(player => {
    playerMap[player.id] = player;
  });
  
  // Check if we already have real players assigned
  const hasRealPlayers = starters.some(s => s.playerId) || subs.some(s => s.playerId);
  
  if (hasRealPlayers) {
    // Update existing players and add new ones to subs
    const newStarters = starters.map(starter => {
      if (starter.playerId && playerMap[starter.playerId]) {
        const player = playerMap[starter.playerId];
        return {
          ...starter,
          jerseyNumber: player.jerseyNumber || starter.jerseyNumber || '',
          playerName: player.lastName || player.firstName || player.name || starter.playerName || ''
        };
      }
      return starter;
    });
    
    const newSubs = subs.map(sub => {
      if (sub.playerId && playerMap[sub.playerId]) {
        const player = playerMap[sub.playerId];
        return {
          ...sub,
          jerseyNumber: player.jerseyNumber || sub.jerseyNumber || '',
          playerName: player.lastName || player.firstName || player.name || sub.playerName || ''
        };
      }
      return sub;
    });
    
    // Find players that aren't assigned to any position
    const assignedPlayerIds = new Set([
      ...newStarters.filter(s => s.playerId).map(s => s.playerId),
      ...newSubs.filter(s => s.playerId).map(s => s.playerId)
    ]);
    
    const unassignedPlayers = players.filter(player => !assignedPlayerIds.has(player.id));
    
    if (unassignedPlayers.length > 0) {
      console.log('Found unassigned players:', unassignedPlayers.length);
      
      // Make a copy of subs to modify
      const updatedSubs = [...newSubs];
      
      unassignedPlayers.forEach(player => {
        // Find an empty substitute slot or add new one
        const emptySlotIndex = updatedSubs.findIndex(sub => !sub.playerId);
        
        if (emptySlotIndex !== -1) {
          // Fill existing empty slot
          updatedSubs[emptySlotIndex] = {
            ...updatedSubs[emptySlotIndex],
            playerId: player.id,
            jerseyNumber: player.jerseyNumber || String((emptySlotIndex + 12)),
            playerName: player.lastName || player.firstName || player.name || '',
            position: player.position || player.preferredPosition || 'SUB'
          };
        } else if (updatedSubs.length < 7) {
          // Add new substitute slot if under limit
          updatedSubs.push({
            id: `sub-${updatedSubs.length + 1}`,
            label: player.position || player.preferredPosition || 'SUB',
            position: player.position || player.preferredPosition || 'SUB',
            playerId: player.id,
            jerseyNumber: player.jerseyNumber || String(updatedSubs.length + 12),
            playerName: player.lastName || player.firstName || player.name || ''
          });
        }
      });
      
      console.log('Updated substitutes with new players:', updatedSubs.length);
      set({ 
        starters: newStarters, 
        subs: updatedSubs,
        saved: false 
      });
      get().saveFormation();
    } else {
      set({ starters: newStarters, subs: newSubs });
    }
  } else {
    // No real players assigned yet - do intelligent assignment
    assignPlayersToFormation(players, preset, get, set);
  }
};
