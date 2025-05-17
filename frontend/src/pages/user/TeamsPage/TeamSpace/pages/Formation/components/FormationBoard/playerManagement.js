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
  
  // 5. Assign remaining players to subs
  const remainingPlayers = playersToAssign.filter(p => !assignedPlayerIds.has(p.id));
  const newSubs = remainingPlayers.slice(0, 7).map((player, index) => {
    return {
      id: `sub-${index + 1}`,
      label: player.position || 'SUB',
      position: player.position || 'SUB',
      playerId: player.id,
      jerseyNumber: player.jerseyNumber || String(index + 12), // Start from 12
      playerName: player.lastName || player.firstName || player.name || `Sub ${index + 1}`
    };
  });
  
  // Fill remaining sub slots with dummy players
  while (newSubs.length < 7) {
    const index = newSubs.length;
    newSubs.push({
      id: `dummy-${index + 12}`,
      label: 'SUB',
      position: 'SUB',
      jerseyNumber: String(index + 12),
      playerName: `Player ${index + 12}`
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
  const { starters, subs, preset } = get();
  
  if (!players || !players.length) return;
  
  // Create a player map for quick lookup
  const playerMap = {};
  players.forEach(player => {
    playerMap[player.id] = player;
  });
  
  // Check if we already have real players assigned
  const hasRealPlayers = starters.some(s => s.playerId) || subs.some(s => s.playerId);
  
  if (hasRealPlayers) {
    // Just update player details for already assigned players
    const newStarters = starters.map(starter => {
      if (starter.playerId && playerMap[starter.playerId]) {
        const player = playerMap[starter.playerId];
        return {
          ...starter,
          jerseyNumber: player.jerseyNumber || '',
          playerName: player.lastName || player.firstName || player.name || ''
        };
      }
      return starter;
    });
    
    const newSubs = subs.map(sub => {
      if (sub.playerId && playerMap[sub.playerId]) {
        const player = playerMap[sub.playerId];
        return {
          ...sub,
          jerseyNumber: player.jerseyNumber || '',
          playerName: player.lastName || player.firstName || player.name || ''
        };
      }
      return sub;
    });
    
    set({ starters: newStarters, subs: newSubs });
  } else {
    // No real players assigned yet - do intelligent assignment
    assignPlayersToFormation(players, preset, get, set);
  }
};
