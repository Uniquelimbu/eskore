import { create } from 'zustand';
import apiClient from '../../../../../../../services/apiClient';

// Formation presets with normalized coordinates (0-100 range)
const PRESETS = {
  '4-3-3': [
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 90 },
    { id: 'lb', label: 'LB', xNorm: 20, yNorm: 70 },
    { id: 'cb1', label: 'CB', xNorm: 40, yNorm: 70 },
    { id: 'cb2', label: 'CB', xNorm: 60, yNorm: 70 },
    { id: 'rb', label: 'RB', xNorm: 80, yNorm: 70 },
    { id: 'cdm', label: 'CDM', xNorm: 50, yNorm: 50 },
    { id: 'cm1', label: 'CM', xNorm: 35, yNorm: 40 },
    { id: 'cm2', label: 'CM', xNorm: 65, yNorm: 40 },
    { id: 'lw', label: 'LW', xNorm: 20, yNorm: 25 },
    { id: 'st', label: 'ST', xNorm: 50, yNorm: 20 },
    { id: 'rw', label: 'RW', xNorm: 80, yNorm: 25 },
  ],
  '4-4-2': [
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 90 },
    { id: 'lb', label: 'LB', xNorm: 20, yNorm: 70 },
    { id: 'cb1', label: 'CB', xNorm: 40, yNorm: 70 },
    { id: 'cb2', label: 'CB', xNorm: 60, yNorm: 70 },
    { id: 'rb', label: 'RB', xNorm: 80, yNorm: 70 },
    { id: 'lm', label: 'LM', xNorm: 20, yNorm: 45 },
    { id: 'cm1', label: 'CM', xNorm: 40, yNorm: 45 },
    { id: 'cm2', label: 'CM', xNorm: 60, yNorm: 45 },
    { id: 'rm', label: 'RM', xNorm: 80, yNorm: 45 },
    { id: 'st1', label: 'ST', xNorm: 40, yNorm: 20 },
    { id: 'st2', label: 'ST', xNorm: 60, yNorm: 20 },
  ],
  '3-5-2': [
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 90 },
    { id: 'cb1', label: 'CB', xNorm: 30, yNorm: 70 },
    { id: 'cb2', label: 'CB', xNorm: 50, yNorm: 70 },
    { id: 'cb3', label: 'CB', xNorm: 70, yNorm: 70 },
    { id: 'lwb', label: 'LWB', xNorm: 15, yNorm: 55 },
    { id: 'cm1', label: 'CM', xNorm: 35, yNorm: 50 },
    { id: 'cdm', label: 'CDM', xNorm: 50, yNorm: 45 },
    { id: 'cm2', label: 'CM', xNorm: 65, yNorm: 50 },
    { id: 'rwb', label: 'RWB', xNorm: 85, yNorm: 55 },
    { id: 'st1', label: 'ST', xNorm: 40, yNorm: 20 },
    { id: 'st2', label: 'ST', xNorm: 60, yNorm: 20 },
  ],
};

// Initial dummy subs with sequential naming - add an 8th player as a placeholder
const DEFAULT_SUBS = [
  { id: 'dummy-12', label: 'SUB', position: 'ST', jerseyNumber: '12', playerName: 'Player 12' },
  { id: 'dummy-13', label: 'SUB', position: 'CAM', jerseyNumber: '13', playerName: 'Player 13' },
  { id: 'dummy-14', label: 'SUB', position: 'LM', jerseyNumber: '14', playerName: 'Player 14' },
  { id: 'dummy-15', label: 'SUB', position: 'CDM', jerseyNumber: '15', playerName: 'Player 15' },
  { id: 'dummy-16', label: 'SUB', position: 'RB', jerseyNumber: '16', playerName: 'Player 16' },
  { id: 'dummy-17', label: 'SUB', position: 'CB', jerseyNumber: '17', playerName: 'Player 17' },
  { id: 'dummy-18', label: 'SUB', position: 'GK', jerseyNumber: '18', playerName: 'Player 18' },
  { id: 'dummy-19', label: 'SUB', position: 'UT', jerseyNumber: 'UT', playerName: 'Placeholder', isPlaceholder: true },
];

// Helper function to find a player and their location
const findPlayerAndLocation = (playerId, starters, subs) => {
  const starterIndex = starters.findIndex(p => p.id === playerId);
  if (starterIndex !== -1) {
    return { player: starters[starterIndex], list: starters, index: starterIndex, isStarter: true };
  }
  const subIndex = subs.findIndex(p => p.id === playerId);
  if (subIndex !== -1) {
    return { player: subs[subIndex], list: subs, index: subIndex, isStarter: false };
  }
  return null;
};

// Create the store with a more explicit approach for React 18 compatibility
const useFormationStore = create((set, get) => ({
  // State
  teamId: null,
  starters: [], // Array of {id, label, xNorm, yNorm, playerId, jerseyNumber, playerName}
  subs: [], // Array of {id, label, playerId, jerseyNumber, playerName}
  preset: '4-3-3',
  loading: false,
  saved: true,
  
  // Export PRESETS for direct access in components
  PRESETS,
  
  // Initialize store with team ID and load data
  init: async (teamId) => {
    if (!teamId) {
      console.warn('Formation init called without teamId, using default preset');
      get().setDummyPlayers(); // Use setDummyPlayers directly instead of changePreset
      set({ loading: false });
      return;
    }
    
    set({ teamId, loading: true });
    try {
      // Try to load existing formation from API
      console.log(`Attempting to fetch formation for team ${teamId}`);
      let response;
      try {
        // Ensure ALL axios requests use the /api/formations/ prefix:
        response = await apiClient.get(`/api/formations/${teamId}`);
        console.log(`Formation API response received for team ${teamId}:`, 
          response.status === 200 ? 'Success' : `Unexpected status: ${response.status}`);
      } catch (error) {
        // If 404, the formation doesn't exist yet - we'll create one
        if (error.response && error.response.status === 404) {
          console.log('Formation API endpoint not found (404), creating default formation');
          // Create a default formation in the backend
          const defaultCreated = await get().createDefaultFormation(teamId);
          
          if (defaultCreated) {
            // Try to fetch again after creating
            try {
              response = await apiClient.get(`/api/formations/${teamId}`);
              console.log(`Retrieved newly created formation for team ${teamId}`);
            } catch (secondFetchError) {
              console.error('Failed to fetch newly created formation:', secondFetchError);
              // Fall back to dummy players
              get().setDummyPlayers();
              set({ loading: false, saved: true });
              return;
            }
          } else {
            // Fall back to dummy players if creation failed
            get().setDummyPlayers();
            set({ loading: false, saved: true });
            return;
          }
        } else {
          // Log detailed error information
          console.error('Error fetching formation:', error);
          if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
          } else if (error.request) {
            console.error('Request made but no response received');
          } else {
            console.error('Error message:', error.message);
          }
          // Fall back to dummy players on error
          get().setDummyPlayers();
          set({ loading: false, saved: true });
          return;
        }
      }
      
      if (response && response.data && response.data.schema_json) {
        const { preset, starters, subs } = response.data.schema_json;
        
        // Check if starters and subs exist and have content, otherwise use default data
        const hasValidStarters = starters && Array.isArray(starters) && starters.length > 0;
        const hasValidSubs = subs && Array.isArray(subs) && subs.length > 0;
        
        if (hasValidStarters || hasValidSubs) {
          // Ensure we don't exceed 11 starters (handle historic bugs)
          const validStarters = hasValidStarters ? starters.slice(0, 11) : [];
          
          set({ 
            preset: preset || '4-3-3',
            starters: validStarters,
            subs: hasValidSubs ? subs : DEFAULT_SUBS,
            loading: false,
            saved: true
          });
          return;
        }
      }
      
      // If no valid data exists, initialize with dummy players
      console.log('No valid formation data found, using dummy players');
      get().setDummyPlayers();
      // And also create a default formation in the backend
      await get().createDefaultFormation(teamId);
      set({ loading: false, saved: true });
    } catch (error) {
      console.error('Failed to load formation:', error);
      // Initialize with dummy players on error
      console.log('Error loading formation, using dummy players instead');
      get().setDummyPlayers();
      set({ loading: false });
    }
  },
  
  // New method: Create default formation in the backend
  createDefaultFormation: async (teamId) => {
    try {
      set({ loading: true });
      console.log('Creating default formation for team', teamId);
      
      // First try to GET the formation - the backend will return a default if it doesn't exist
      const response = await apiClient.get(`/api/formations/${teamId}`);
      
      // Check if we got a formation that's not saved (marked by the backend)
      if (response && response.notSaved) {
        console.log('Received default formation template from server');
        const defaultFormation = response.schema_json || {};
        
        // Ensure starters and subs are always arrays
        const starters = Array.isArray(defaultFormation.starters) ? defaultFormation.starters : [];
        const subs = Array.isArray(defaultFormation.subs) ? defaultFormation.subs : DEFAULT_SUBS;
        
        // Update the local state with the default formation
        set({ 
          teamId,
          starters: starters,
          subs: subs,
          preset: defaultFormation.preset || '4-3-3',
          loading: false,
          saved: false // Mark as not saved
        });
        
        return response;
      }
      
      // Otherwise, we got a real formation from the database
      if (response) {
        console.log('Successfully created/fetched default formation');
        const schemaJson = response.schema_json || {};
        
        // Ensure starters and subs are always arrays
        const starters = Array.isArray(schemaJson.starters) ? schemaJson.starters : [];
        const subs = Array.isArray(schemaJson.subs) ? schemaJson.subs : DEFAULT_SUBS;
        
        set({
          teamId,
          starters: starters,
          subs: subs,
          preset: schemaJson.preset || '4-3-3',
          loading: false,
          saved: true
        });
        return response;
      }
    } catch (error) {
      console.error('Failed to create default formation:', error);
      // If we get Forbidden, still create a client-side default
      if (error.status === 403 || (error.response && error.response.status === 403)) {
        console.log('Server responded with error:', error.status || error.response?.status, error.data || error.response?.data);
        
        // If forbidden, use local defaults
        const preset = '4-3-3';
        const defaultData = get().generateDefaultStarters(preset);
        
        // Ensure defaultData.starters is an array
        const starters = Array.isArray(defaultData) ? defaultData : [];
        
        set({
          teamId,
          starters: starters,
          subs: DEFAULT_SUBS,
          preset: preset,
          loading: false,
          saved: false // Mark as not saved since this is client-side only
        });
        
        return { 
          teamId, 
          schema_json: { 
            starters: starters, 
            subs: DEFAULT_SUBS, 
            preset: preset 
          }, 
          isDefault: true, 
          clientGenerated: true 
        };
      }
      
      // Ensure we set valid defaults even on error
      set({ 
        loading: false,
        starters: [],
        subs: DEFAULT_SUBS
      });
      
      throw error;
    }
  },

  // Generate default starters based on a preset
  generateDefaultStarters: (preset) => {
    return PRESETS[preset].map((pos, index) => {
      return {
        ...pos,
        position: pos.label,
        jerseyNumber: String(index + 1), // Players 1-11
        playerName: `Player ${index + 1}`, // This ensures players are named Player 1, Player 2, etc.
        playerId: null,
        positionId: pos.id // Ensure positionId is set correctly
      };
    });
  },
  
  // Add dummy player data for demo purposes
  setDummyPlayers: () => {
    const { preset } = get();
    
    // Create dummy starters based on current formation with sequential naming
    const dummyStarters = get().generateDefaultStarters(preset || '4-3-3');
    
    set({ 
      preset: preset || '4-3-3',
      starters: dummyStarters,
      subs: DEFAULT_SUBS,
      saved: true // Mark as saved initially
    });
  },
  
  // Change formation preset - FIXED VERSION
  changePreset: (newPreset) => {
    if (!PRESETS[newPreset]) return;

    // Keep player assignments when changing formation
    const { starters, subs } = get();
    const currentPlayerMap = {};
    
    starters.forEach(player => {
      if (player.playerId || player.playerName) { // Also consider playerName
        currentPlayerMap[player.id] = {
          playerId: player.playerId,
          jerseyNumber: player.jerseyNumber,
          playerName: player.playerName
        };
      }
    });
    
    // Apply the new preset positions
    const newStarters = PRESETS[newPreset].map((pos, index) => {
      // Preserve player data if this position existed in the old formation
      const playerData = currentPlayerMap[pos.id] || {};
      
      return {
        ...pos,
        ...playerData,
        playerId: playerData.playerId || null,
        position: pos.label,
        jerseyNumber: playerData.jerseyNumber || String(index + 1),
        playerName: playerData.playerName || `Player ${index + 1}`,
        positionId: pos.id
      };
    });
    
    set({ 
      preset: newPreset, 
      starters: newStarters, 
      saved: false 
    });
    
    // Save the updated formation
    get().saveFormation();
  },
  
  // Handle different drag scenarios - FIXED VERSION
  handleDrag: (id, newX, newY, targetType) => {
    const { starters, subs } = get();
    
    // Find the player's location (starter or sub)
    const isStarter = starters.some(s => s.id === id);
    
    if (isStarter) {
      const starterIndex = starters.findIndex(s => s.id === id);
      if (starterIndex === -1) return;
      
      const newStarters = [...starters];
      const newSubs = [...subs];
      
      if (targetType === 'pitch') {
        // Update position on pitch - find closest position in the formation
        const currentPreset = PRESETS[get().preset];
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
        const currentPreset = PRESETS[get().preset];
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
  },
  
  // Swap two players - enhance to handle all cases properly
  swapPlayers: (id1, id2, bothStarters) => {
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
  },
  
  // Map real players to positions - enhanced with intelligent assignment  
  mapPlayersToPositions: (players) => {
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
      get().assignPlayersToFormation(players, preset);
    }
  },
  
  // New method: Intelligently assign players to formation positions
  assignPlayersToFormation: (players, presetName) => {
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
    
    // 3. Fisher-Yates shuffle for each category to randomize assignment
    const shuffle = array => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    
    Object.keys(playerCategories).forEach(key => {
      playerCategories[key] = shuffle(playerCategories[key]);
    });
    
    // 4. Assign players to positions based on categories
    const newStarters = Array(presetPositions.length).fill(null);
    const assignedPlayerIds = new Set();
    
    // First assign the keepers
    for (const posId of positionCategories.GK) {
      const player = playerCategories.GK.shift() || playerCategories.OTHER.shift();
      if (player) {
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
    
    // Then defenders
    for (const posId of positionCategories.DF) {
      const player = playerCategories.DF.shift() || playerCategories.OTHER.shift();
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
    
    // Then midfielders
    for (const posId of positionCategories.MF) {
      const player = playerCategories.MF.shift() || playerCategories.OTHER.shift();
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
    
    // Then forwards
    for (const posId of positionCategories.FW) {
      const player = playerCategories.FW.shift() || playerCategories.OTHER.shift();
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
    
    // If we don't have enough subs, fill with dummy subs
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
    
    // Update state with the new assignments
    set({ 
      starters: finalStarters, 
      subs: newSubs,
      saved: false // Mark as unsaved to trigger auto-save
    });
    
    // Save the new assignments to the backend
    get().saveFormation();
  },
  
  // Save formation to server - with improved error handling
  saveFormation: async () => {
    const { teamId, starters, subs, preset } = get();
    
    if (!teamId) {
      console.error('Cannot save formation: teamId is missing');
      return { error: 'Missing teamId', success: false };
    }
    
    try {
      set({ loading: true });
      
      const schemaJson = {
        preset,
        starters,
        subs,
        updated_at: new Date().toISOString()
      };
      
      console.log('Saving formation for team:', teamId);
      
      // Use apiClient for consistent error handling across the app
      const response = await apiClient.put(`/api/formations/${teamId}`, { 
        schema_json: schemaJson 
      });
      
      console.log('Formation saved successfully:', response);
      set({ saved: true, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Failed to save formation:', error);
      
      // Enhanced error logging for debugging
      let errorMessage = 'Unknown error saving formation';
      
      if (error.response) {
        errorMessage = `Server responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage = 'No response received from server. Check if backend is running.';
      } else {
        errorMessage = `Error setting up request: ${error.message}`;
      }
      
      console.error(errorMessage);
      
      // Continue with local state rather than failing completely
      set({ loading: false });
      
      // Return the error so it can be handled by the calling component 
      return { 
        error: errorMessage, 
        originalError: error,
        success: false
      };
    }
  },

  // Export formation as PNG
  exportAsPNG: async (stageRef) => {
    if (!stageRef.current) return;

    try {
      // Generate high resolution PNG
      const dataURL = stageRef.current.toDataURL({
        pixelRatio: 2,
        mimeType: 'image/png'
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `formation-${get().preset}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export formation as PNG:', error);
    }
  },

  // Action to move a player (from anywhere) to a specific pitch position
  movePlayerToPosition: (draggedPlayerId, targetPositionId, wasStarter, originalPosId, originalSubIdx) => set(state => {
    let { starters, subs } = state; // Removed PRESETS, preset from destructuring
    starters = [...starters]; subs = [...subs]; // Immutable updates

    const draggedPlayerLocation = findPlayerAndLocation(draggedPlayerId, starters, subs);
    if (!draggedPlayerLocation) { console.error("Dragged player not found in store"); return {}; }

    // Remove dragged player from original list    
    draggedPlayerLocation.list.splice(draggedPlayerLocation.index, 1);
    let playerToMove = { ...draggedPlayerLocation.player };

    // Find if target position is occupied
    const occupantLocation = findPlayerAndLocation(starters.find(p => p.positionId === targetPositionId)?.id, starters, []); // Search only starters for occupant
    
    // Update playerToMove for its new pitch position
    const targetPosData = state.PRESETS[state.preset].find(p => p.id === targetPositionId); // Use state.PRESETS and state.preset
    playerToMove.isStarter = true;
    playerToMove.positionId = targetPositionId;
    playerToMove.xNorm = targetPosData.xNorm;
    playerToMove.yNorm = targetPosData.yNorm;
    playerToMove.label = targetPosData.label; // Update label to new position
    
    starters.push(playerToMove); // Add to starters

    if (occupantLocation) { // If target position was occupied
      const occupant = occupantLocation.player;
      starters.splice(occupantLocation.index, 1); // Remove occupant from its old starter position

      // Move occupant to where dragged player came from OR to subs
      if (wasStarter && originalPosId && originalPosId !== targetPositionId) {
        // Try to move occupant to dragged player's original starter slot
        const originalPosData = state.PRESETS[state.preset].find(p => p.id === originalPosId); // Use state.PRESETS and state.preset
        occupant.isStarter = true;
        occupant.positionId = originalPosId;
        occupant.xNorm = originalPosData.xNorm;
        occupant.yNorm = originalPosData.yNorm;
        occupant.label = originalPosData.label;
        starters.push(occupant);
      } else {
        // Default: move occupant to subs
        occupant.isStarter = false; occupant.positionId = null; // Clear pitch data
        subs.push(occupant);
      }
    }
    return { starters, subs, saved: false };
  }),

  // Action to move a player (from anywhere) to a specific sub slot
  movePlayerToSubSlot: (draggedPlayerId, targetSubIndex, wasStarter, originalPosId, originalSubIdx) => set(state => {
    let { starters, subs } = state; // Removed PRESETS, preset from destructuring
    starters = [...starters]; subs = [...subs];

    const draggedPlayerLocation = findPlayerAndLocation(draggedPlayerId, starters, subs);
    if (!draggedPlayerLocation) { console.error("Dragged player not found for sub move"); return {}; }

    draggedPlayerLocation.list.splice(draggedPlayerLocation.index, 1);
    let playerToMove = { ...draggedPlayerLocation.player, isStarter: false, positionId: null }; // Now a sub
    
    let occupant = null;
    if (targetSubIndex >= 0 && targetSubIndex < subs.length) {
      occupant = subs[targetSubIndex]; // Get potential occupant
      subs.splice(targetSubIndex, 0, playerToMove); // Insert player, occupant shifts
      if(occupant && occupant.id === playerToMove.id) occupant = null; // if player was moved within subs to same effective spot
      else if (occupant) subs = subs.filter(p => p.id !== occupant.id || p === playerToMove); // remove occupant from its new shifted spot if it's not the playerToMove
    } else { // Append if targetSubIndex is out of bounds or -1
      subs.push(playerToMove);
    }
    
    if (occupant) { // If a different player was at targetSubIndex
      if (!wasStarter && originalSubIdx !== null && originalSubIdx !== targetSubIndex) {
         // Move occupant to dragged player's original sub slot (if different)
        subs.splice(originalSubIdx, 0, occupant);
      } else { // Dragged player was a starter, or sub moved to its own previous spot (occupant needs new home)
        // Try to move occupant to an empty starter slot or add to subs
        const emptyStarterSlot = state.PRESETS[state.preset].find(pos => !starters.some(s => s.positionId === pos.id)); // Use state.PRESETS and state.preset
        if (emptyStarterSlot) {
          occupant.isStarter = true; occupant.positionId = emptyStarterSlot.id;
          occupant.xNorm = emptyStarterSlot.xNorm; occupant.yNorm = emptyStarterSlot.yNorm; occupant.label = emptyStarterSlot.label;
          starters.push(occupant);
        } else {
          subs.push(occupant); // Add to end of subs if no starter slot
        }
      }
    }
    return { starters, subs, saved: false };
  }),
  
  // Action for when a starter is dropped onto the general subs strip area
  moveStarterToSubsGeneral: (draggedPlayerId, originalPositionId) => set(state => {
    let { starters, subs } = state;
    starters = [...starters]; subs = [...subs];

    const starterIndex = starters.findIndex(p => p.id === draggedPlayerId);
    if (starterIndex === -1) { console.error("Starter to move to subs not found"); return {}; }

    const playerToMove = starters.splice(starterIndex, 1)[0];
    playerToMove.isStarter = false; playerToMove.positionId = null; // Now a sub
    subs.push(playerToMove); // Add to the end of subs list

    return { starters, subs, saved: false };
  }),

  // Action to swap two players (could be starter-starter, sub-sub, or starter-sub)
  swapPlayersInFormation: (player1Id, player2Id) => set(state => {
    let { starters, subs } = state; // Removed PRESETS, preset as they are not used in this function
    starters = [...starters]; subs = [...subs];

    const p1Loc = findPlayerAndLocation(player1Id, starters, subs);
    const p2Loc = findPlayerAndLocation(player2Id, starters, subs);

    if (!p1Loc || !p2Loc) { console.error("One or both players for swap not found"); return {}; }

    const p1 = { ...p1Loc.player }; const p2 = { ...p2Loc.player };

    // Case 1: Both Starters
    if (p1Loc.isStarter && p2Loc.isStarter) {
      starters[p1Loc.index] = { ...p2, positionId: p1.positionId, xNorm: p1.xNorm, yNorm: p1.yNorm, label: p1.label, isStarter: true };
      starters[p2Loc.index] = { ...p1, positionId: p2.positionId, xNorm: p2.xNorm, yNorm: p2.yNorm, label: p2.label, isStarter: true };
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
      const newStarter = { ...sub, isStarter: true, positionId: starter.positionId, xNorm: starter.xNorm, yNorm: starter.yNorm, label: starter.label };
      starters[starterIdx] = newStarter;
      
      // Starter becomes sub
      const newSub = { ...starter, isStarter: false, positionId: null };
      subs[subIdx] = newSub;
    }
    return { starters, subs, saved: false };
  }),
}));

// Export the store hook explicitly
export default useFormationStore;
