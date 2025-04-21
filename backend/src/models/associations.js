/**
 * Sets up all database model associations
 */
const User = require('./User');
const Team = require('./Team');
const League = require('./League');
const Athlete = require('./Athlete');
const Match = require('./Match');
const Manager = require('./Manager'); 

function setupAssociations() {
  // Team belongs to League
  Team.belongsTo(League, { foreignKey: 'leagueId' });
  
  // League has many Teams
  League.hasMany(Team, { foreignKey: 'leagueId' });
  
  // Match belongs to League
  Match.belongsTo(League, { foreignKey: 'leagueId' });
  
  // League has many Matches
  League.hasMany(Match, { foreignKey: 'leagueId' });
  
  // Match belongs to home and away teams
  Match.belongsTo(Team, { as: 'homeTeam', foreignKey: 'homeTeamId' });
  Match.belongsTo(Team, { as: 'awayTeam', foreignKey: 'awayTeamId' });
  
  // Team has many matches as home and away
  Team.hasMany(Match, { as: 'homeMatches', foreignKey: 'homeTeamId' });
  Team.hasMany(Match, { as: 'awayMatches', foreignKey: 'awayTeamId' });
  
  // Manager belongs to Team
  Manager.belongsTo(Team, { foreignKey: 'teamId' });
  
  // Team has many Managers
  Team.hasMany(Manager, { foreignKey: 'teamId' });
}

module.exports = { setupAssociations };
