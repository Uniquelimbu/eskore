/**
 * Soccer-specific utilities for the application
 */

// Map position codes to full names
export const positionMapping = {
  // Basic positions
  'GK': 'Goalkeeper',
  'DF': 'Defender',
  'MF': 'Midfielder',
  'FW': 'Forward',
  
  // Specific positions
  'LB': 'Left Back',
  'CB': 'Center Back',
  'RB': 'Right Back',
  'CDM': 'Defensive Midfielder',
  'CM': 'Central Midfielder',
  'CAM': 'Attacking Midfielder',
  'LM': 'Left Midfielder',
  'RM': 'Right Midfielder',
  'LW': 'Left Winger',
  'RW': 'Right Winger',
  'CF': 'Center Forward',
  'ST': 'Striker'
};

// Common soccer stats categories
export const statCategories = {
  'offense': 'Offensive',
  'defense': 'Defensive',
  'technical': 'Technical',
  'physical': 'Physical',
  'fitness': 'Fitness',
  'goalkeeper': 'Goalkeeper',
  'performance': 'General Performance'
};

// Common units for soccer stats
export const commonStatUnits = {
  'goals': '',
  'assists': '',
  'shots': '',
  'passes': '',
  'tackles': '',
  'interceptions': '',
  'saves': '',
  'clean_sheets': '',
  'accuracy': '%',
  'speed': 'km/h',
  'distance': 'km'
};

// Helper function to get recommended stat unit
export const getRecommendedUnit = (statName) => {
  const normalizedName = statName.toLowerCase();
  
  if (normalizedName.includes('percent') || normalizedName.includes('accuracy') || normalizedName.includes('rate')) {
    return '%';
  }
  
  if (normalizedName.includes('speed')) {
    return 'km/h';
  }
  
  if (normalizedName.includes('distance')) {
    return 'km';
  }
  
  // No unit for count-based stats (goals, assists, etc.)
  return '';
};

// Common achievement categories for soccer
export const achievementCategories = {
  'award': 'Award',
  'team': 'Team Achievement',
  'individual': 'Individual Achievement',
  'recognition': 'Recognition',
  'leadership': 'Leadership',
  'performance': 'Performance Milestone',
  'development': 'Player Development'
};
