const { Formation, User } = require('../models');

/**
 * Assigns players to a formation based on their position preferences and ratings
 * @param {Array} players - Array of player objects
 * @param {Object} formationData - Formation data with positions
 * @returns {Object} Updated formation data with assigned players
 */
async function assignPlayersToFormation(players, formationData) {
  // Deep clone the formation data
  const updatedFormation = JSON.parse(JSON.stringify(formationData));
  
  // Group players by their preferred positions
  const playersByPosition = {};
  players.forEach(player => {
    if (player.preferredPosition) {
      if (!playersByPosition[player.preferredPosition]) {
        playersByPosition[player.preferredPosition] = [];
      }
      playersByPosition[player.preferredPosition].push(player);
    }
  });
  
  // First pass: Assign players to their exact preferred positions
  updatedFormation.positions.forEach(position => {
    const positionType = position.role;
    if (playersByPosition[positionType] && playersByPosition[positionType].length > 0) {
      // Sort by rating (highest first)
      playersByPosition[positionType].sort((a, b) => b.rating - a.rating);
      
      // Assign highest rated player
      const player = playersByPosition[positionType].shift();
      position.playerId = player.id;
      position.playerName = player.name;
    }
  });
  
  // Second pass: Assign remaining players to similar positions
  updatedFormation.positions.forEach(position => {
    if (position.playerId) return; // Skip already assigned positions
    
    const positionZone = position.role.charAt(0); // Get first letter (D/M/F)
    
    // Find players who play in similar positions
    const similarPositionPlayers = Object.keys(playersByPosition)
      .filter(pos => pos.charAt(0) === positionZone)
      .flatMap(pos => playersByPosition[pos])
      .sort((a, b) => b.rating - a.rating);
    
    if (similarPositionPlayers.length > 0) {
      const player = similarPositionPlayers.shift();
      // Remove this player from their original position array
      Object.keys(playersByPosition).forEach(pos => {
        playersByPosition[pos] = playersByPosition[pos].filter(p => p.id !== player.id);
      });
      
      position.playerId = player.id;
      position.playerName = player.name;
    }
  });
  
  return updatedFormation;
}

/**
 * Fetches complete player information for a formation
 * @param {Object} formationData - Formation data with player IDs
 * @returns {Object} Formation data with complete player information
 */
async function populateFormationWithPlayers(formationData) {
  // Get all unique player IDs from the formation
  const playerIds = formationData.positions
    .filter(pos => pos.playerId)
    .map(pos => pos.playerId);
  
  if (playerIds.length === 0) return formationData;
  
  // Fetch player data
  const players = await User.findAll({
    where: { id: playerIds },
    attributes: ['id', 'name', 'photo', 'rating', 'preferredPosition']
  });
  
  // Create player map for quick access
  const playerMap = players.reduce((map, player) => {
    map[player.id] = player;
    return map;
  }, {});
  
  // Update formation positions with complete player data
  const updatedPositions = formationData.positions.map(position => {
    if (position.playerId && playerMap[position.playerId]) {
      const player = playerMap[position.playerId];
      return {
        ...position,
        playerName: player.name,
        playerPhoto: player.photo,
        playerRating: player.rating
      };
    }
    return position;
  });
  
  return {
    ...formationData,
    positions: updatedPositions
  };
}

module.exports = {
  assignPlayersToFormation,
  populateFormationWithPlayers
};
