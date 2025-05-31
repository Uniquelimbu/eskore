// Formation presets with normalized coordinates (0-100 range)

// Helper function to adjust player positions to avoid overlapping
const adjustPositions = (positions) => {
  // Sort positions into rows by Y coordinate
  const rows = {};
  positions.forEach(pos => {
    const rowKey = Math.round(pos.yNorm / 10) * 10; // Group by rounded y-coordinate
    if (!rows[rowKey]) rows[rowKey] = [];
    rows[rowKey].push(pos);
  });
  
  // For each row, ensure players are horizontally spaced
  Object.values(rows).forEach(row => {
    if (row.length <= 1) return; // Skip rows with only one player
    
    // Sort by x position
    row.sort((a, b) => a.xNorm - b.xNorm);
    
    // Calculate minimum required spacing (percentage points)
    const minSpacing = 25; // Increased from 20 to 25 for better horizontal spacing
    
    // Adjust positions if needed
    for (let i = 1; i < row.length; i++) {
      const prevPos = row[i-1];
      const currPos = row[i];
      const currentSpacing = currPos.xNorm - prevPos.xNorm;
      
      if (currentSpacing < minSpacing) {
        // Move current position to the right
        const adjustment = (minSpacing - currentSpacing) / 2;
        currPos.xNorm += adjustment;
        prevPos.xNorm -= adjustment;
        
        // Make sure we don't go beyond boundaries
        if (currPos.xNorm > 95) currPos.xNorm = 95;
        if (prevPos.xNorm < 5) prevPos.xNorm = 5;
      }
    }
  });
  
  return positions;
};

// Apply the same logic to column spacing (vertical)
const ensureVerticalSpacing = (positions) => {
  // Sort positions into columns by X coordinate
  const columns = {};
  positions.forEach(pos => {
    const colKey = Math.round(pos.xNorm / 10) * 10; // Group by rounded x-coordinate
    if (!columns[colKey]) columns[colKey] = [];
    columns[colKey].push(pos);
  });
  
  // For each column, ensure players are vertically spaced
  Object.values(columns).forEach(column => {
    if (column.length <= 1) return; // Skip columns with only one player
    
    // Sort by y position
    column.sort((a, b) => a.yNorm - b.yNorm);
    
    // Calculate minimum required spacing (percentage points)
    const minSpacing = 25; // Increased from 20 to 25 for better vertical spacing
    
    // Adjust positions if needed
    for (let i = 1; i < column.length; i++) {
      const prevPos = column[i-1];
      const currPos = column[i];
      const currentSpacing = currPos.yNorm - prevPos.yNorm;
      
      if (currentSpacing < minSpacing) {
        // Move current position down
        const adjustment = (minSpacing - currentSpacing) / 2;
        currPos.yNorm += adjustment;
        prevPos.yNorm -= adjustment;
        
        // Make sure we don't go beyond boundaries
        if (currPos.yNorm > 95) currPos.yNorm = 95;
        if (prevPos.yNorm < 5) prevPos.yNorm = 5;
      }
    }
  });
  
  return positions;
};

// Specifically adjust goalkeeper position
const adjustGoalkeeperPosition = (positions) => {
  const gkPosition = positions.find(p => p.label === 'GK');
  if (gkPosition) {
    // Place goalkeeper at or very close to the bottom of the field
    gkPosition.yNorm = 95;
  }
  return positions;
};

// Process formations to ensure they utilize more field space
const spreadFormation = (positions) => {
  // Sort by distance from center (50,50)
  positions.forEach(pos => {
    // Calculate distance from center for weighted adjustments
    const distX = pos.xNorm - 50;
    const distY = pos.yNorm - 50;
    
    // Push positions more toward edges (except GK)
    if (pos.label !== 'GK') {
      // Expand x-coordinates to use more width
      if (distX > 0) {
        pos.xNorm = Math.min(95, pos.xNorm + (distX * 0.15));
      } else if (distX < 0) {
        pos.xNorm = Math.max(5, pos.xNorm + (distX * 0.15));
      }
      
      // Expand y-coordinates to use more depth
      if (distY < 0) {
        // Forward positions - push further forward
        pos.yNorm = Math.max(10, pos.yNorm + (distY * 0.2));
      } else if (pos.label !== 'CB' && pos.label !== 'LB' && pos.label !== 'RB') {
        // Midfield positions - push slightly back, but not defenders
        pos.yNorm = Math.min(90, pos.yNorm + (distY * 0.1));
      }
    }
  });
  
  return positions;
};

// Ensure each formation has exactly 11 players (standard soccer team)
const enforceElevenPlayers = (positions) => {
  if (positions.length > 11) {
    console.warn(`Formation has ${positions.length} positions, trimming to 11`);
    return positions.slice(0, 11);
  } else if (positions.length < 11) {
    console.warn(`Formation has only ${positions.length} positions, should have 11`);
  }
  return positions;
};

// Apply all position adjustments in proper sequence
const processFormation = (positions) => {
  return enforceElevenPlayers(
    adjustGoalkeeperPosition(
      spreadFormation(
        ensureVerticalSpacing(
          adjustPositions(positions)
        )
      )
    )
  );
};

// Update your formation presets with enhanced positioning
export const PRESETS = {
  '4-4-2': processFormation([
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 95 },
    { id: 'lb', label: 'LB', xNorm: 15, yNorm: 75 },
    { id: 'cb1', label: 'CB', xNorm: 35, yNorm: 75 },
    { id: 'cb2', label: 'CB', xNorm: 65, yNorm: 75 },
    { id: 'rb', label: 'RB', xNorm: 85, yNorm: 75 },
    { id: 'lm', label: 'LM', xNorm: 15, yNorm: 45 },
    { id: 'cm1', label: 'CM', xNorm: 35, yNorm: 45 },
    { id: 'cm2', label: 'CM', xNorm: 65, yNorm: 45 },
    { id: 'rm', label: 'RM', xNorm: 85, yNorm: 45 },
    { id: 'st1', label: 'ST', xNorm: 35, yNorm: 15 },
    { id: 'st2', label: 'ST', xNorm: 65, yNorm: 15 },
  ]),
  
  '4-3-3': processFormation([
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 95 },
    { id: 'lb', label: 'LB', xNorm: 15, yNorm: 75 },
    { id: 'cb1', label: 'CB', xNorm: 35, yNorm: 75 },
    { id: 'cb2', label: 'CB', xNorm: 65, yNorm: 75 },
    { id: 'rb', label: 'RB', xNorm: 85, yNorm: 75 },
    { id: 'cdm', label: 'CDM', xNorm: 50, yNorm: 55 },
    { id: 'cm1', label: 'CM', xNorm: 30, yNorm: 45 },
    { id: 'cm2', label: 'CM', xNorm: 70, yNorm: 45 },
    { id: 'lw', label: 'LW', xNorm: 15, yNorm: 15 },
    { id: 'st', label: 'ST', xNorm: 50, yNorm: 15 },
    { id: 'rw', label: 'RW', xNorm: 85, yNorm: 15 },
  ]),
  
  '3-5-2': processFormation([
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 95 },
    { id: 'cb1', label: 'CB', xNorm: 25, yNorm: 75 },
    { id: 'cb2', label: 'CB', xNorm: 50, yNorm: 75 },
    { id: 'cb3', label: 'CB', xNorm: 75, yNorm: 75 },
    { id: 'lwb', label: 'LWB', xNorm: 10, yNorm: 60 },
    { id: 'cm1', label: 'CM', xNorm: 30, yNorm: 45 },
    { id: 'cdm', label: 'CDM', xNorm: 50, yNorm: 50 },
    { id: 'cm2', label: 'CM', xNorm: 70, yNorm: 45 },
    { id: 'rwb', label: 'RWB', xNorm: 90, yNorm: 60 },
    { id: 'st1', label: 'ST', xNorm: 35, yNorm: 15 },
    { id: 'st2', label: 'ST', xNorm: 65, yNorm: 15 },
  ]),
  
  '3-4-3': processFormation([
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 95 },
    { id: 'cb1', label: 'CB', xNorm: 25, yNorm: 75 },
    { id: 'cb2', label: 'CB', xNorm: 50, yNorm: 75 },
    { id: 'cb3', label: 'CB', xNorm: 75, yNorm: 75 },
    { id: 'lm', label: 'LM', xNorm: 15, yNorm: 50 },
    { id: 'cm1', label: 'CM', xNorm: 35, yNorm: 45 },
    { id: 'cm2', label: 'CM', xNorm: 65, yNorm: 45 },
    { id: 'rm', label: 'RM', xNorm: 85, yNorm: 50 },
    { id: 'lw', label: 'LW', xNorm: 15, yNorm: 15 },
    { id: 'st', label: 'ST', xNorm: 50, yNorm: 15 },
    { id: 'rw', label: 'RW', xNorm: 85, yNorm: 15 },
  ]),
  
  '4-2-3-1': processFormation([
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 95 },
    { id: 'lb', label: 'LB', xNorm: 15, yNorm: 75 },
    { id: 'cb1', label: 'CB', xNorm: 35, yNorm: 75 },
    { id: 'cb2', label: 'CB', xNorm: 65, yNorm: 75 },
    { id: 'rb', label: 'RB', xNorm: 85, yNorm: 75 },
    { id: 'cdm1', label: 'CDM', xNorm: 35, yNorm: 60 },
    { id: 'cdm2', label: 'CDM', xNorm: 65, yNorm: 60 },
    { id: 'cam1', label: 'CAM', xNorm: 25, yNorm: 35 },
    { id: 'cam2', label: 'CAM', xNorm: 50, yNorm: 30 },
    { id: 'cam3', label: 'CAM', xNorm: 75, yNorm: 35 },
    { id: 'st', label: 'ST', xNorm: 50, yNorm: 15 },
  ]),
  
  '4-1-4-1': processFormation([
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 95 },
    { id: 'lb', label: 'LB', xNorm: 15, yNorm: 75 },
    { id: 'cb1', label: 'CB', xNorm: 35, yNorm: 75 },
    { id: 'cb2', label: 'CB', xNorm: 65, yNorm: 75 },
    { id: 'rb', label: 'RB', xNorm: 85, yNorm: 75 },
    { id: 'cdm', label: 'CDM', xNorm: 50, yNorm: 60 },
    { id: 'lm', label: 'LM', xNorm: 15, yNorm: 40 },
    { id: 'cm1', label: 'CM', xNorm: 35, yNorm: 40 },
    { id: 'cm2', label: 'CM', xNorm: 65, yNorm: 40 },
    { id: 'rm', label: 'RM', xNorm: 85, yNorm: 40 },
    { id: 'st', label: 'ST', xNorm: 50, yNorm: 15 },
  ]),
  
  '5-2-2-1': processFormation([
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 95 },
    { id: 'lwb', label: 'LWB', xNorm: 10, yNorm: 70 },
    { id: 'cb1', label: 'CB', xNorm: 30, yNorm: 75 },
    { id: 'cb2', label: 'CB', xNorm: 50, yNorm: 75 },
    { id: 'cb3', label: 'CB', xNorm: 70, yNorm: 75 },
    { id: 'rwb', label: 'RWB', xNorm: 90, yNorm: 70 },
    { id: 'cm1', label: 'CM', xNorm: 30, yNorm: 50 },
    { id: 'cm2', label: 'CM', xNorm: 70, yNorm: 50 },
    { id: 'cam1', label: 'CAM', xNorm: 25, yNorm: 30 },
    { id: 'cam2', label: 'CAM', xNorm: 75, yNorm: 30 },
    { id: 'st', label: 'ST', xNorm: 50, yNorm: 15 },
  ]),
  
  '4-1-2-1-2': processFormation([
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 95 },
    { id: 'lb', label: 'LB', xNorm: 15, yNorm: 75 },
    { id: 'cb1', label: 'CB', xNorm: 35, yNorm: 75 },
    { id: 'cb2', label: 'CB', xNorm: 65, yNorm: 75 },
    { id: 'rb', label: 'RB', xNorm: 85, yNorm: 75 },
    { id: 'cdm', label: 'CDM', xNorm: 50, yNorm: 60 },
    { id: 'lcm', label: 'CM', xNorm: 30, yNorm: 45 },
    { id: 'rcm', label: 'CM', xNorm: 70, yNorm: 45 },
    { id: 'cam', label: 'CAM', xNorm: 50, yNorm: 30 },
    { id: 'lst', label: 'ST', xNorm: 35, yNorm: 15 },
    { id: 'rst', label: 'ST', xNorm: 65, yNorm: 15 },
  ]),
  
  '4-5-1': processFormation([
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 95 },
    { id: 'lb', label: 'LB', xNorm: 15, yNorm: 75 },
    { id: 'cb1', label: 'CB', xNorm: 35, yNorm: 75 },
    { id: 'cb2', label: 'CB', xNorm: 65, yNorm: 75 },
    { id: 'rb', label: 'RB', xNorm: 85, yNorm: 75 },
    { id: 'lm', label: 'LM', xNorm: 10, yNorm: 45 },
    { id: 'lcm', label: 'CM', xNorm: 30, yNorm: 45 },
    { id: 'cm', label: 'CM', xNorm: 50, yNorm: 45 },
    { id: 'rcm', label: 'CM', xNorm: 70, yNorm: 45 },
    { id: 'rm', label: 'RM', xNorm: 90, yNorm: 45 },
    { id: 'st', label: 'ST', xNorm: 50, yNorm: 15 },
  ]),
  
  '4-2-2-2': processFormation([
    { id: 'gk', label: 'GK', xNorm: 50, yNorm: 95 },
    { id: 'lb', label: 'LB', xNorm: 15, yNorm: 75 },
    { id: 'cb1', label: 'CB', xNorm: 35, yNorm: 75 },
    { id: 'cb2', label: 'CB', xNorm: 65, yNorm: 75 },
    { id: 'rb', label: 'RB', xNorm: 85, yNorm: 75 },
    { id: 'cdm1', label: 'CDM', xNorm: 35, yNorm: 60 },
    { id: 'cdm2', label: 'CDM', xNorm: 65, yNorm: 60 },
    { id: 'cam1', label: 'CAM', xNorm: 30, yNorm: 35 },
    { id: 'cam2', label: 'CAM', xNorm: 70, yNorm: 35 },
    { id: 'st1', label: 'ST', xNorm: 35, yNorm: 15 },
    { id: 'st2', label: 'ST', xNorm: 65, yNorm: 15 },
  ]),
};

// Default subs array
export const DEFAULT_SUBS = [
  { id: 'sub-1', label: 'SUB', jerseyNumber: '12', playerName: 'Player 12' },
  { id: 'sub-2', label: 'SUB', jerseyNumber: '13', playerName: 'Player 13' },
  { id: 'sub-3', label: 'SUB', jerseyNumber: '14', playerName: 'Player 14' },
  { id: 'sub-4', label: 'SUB', jerseyNumber: '15', playerName: 'Player 15' },
  { id: 'sub-5', label: 'SUB', jerseyNumber: '16', playerName: 'Player 16' },
  { id: 'sub-6', label: 'SUB', jerseyNumber: '17', playerName: 'Player 17' },
  { id: 'sub-7', label: 'SUB', jerseyNumber: '18', playerName: 'Player 18' }
];