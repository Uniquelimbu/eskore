/**
 * Sets up all database model associations
 */
const User = require('./User');
const Team = require('./Team');
const League = require('./League');
const Athlete = require('./Athlete'); // Legacy - will be migrated to User
const Match = require('./Match');
const Manager = require('./Manager'); // Legacy - will be migrated to User
const Role = require('./Role');
const UserRole = require('./UserRole');
const UserTeam = require('./UserTeam');
const Tournament = require('./Tournament');
const UserTournament = require('./UserTournament');
const TeamTournament = require('./TeamTournament');

function setupAssociations() {
  // Existing associations
  Team.belongsTo(League, { foreignKey: 'leagueId' });
  League.hasMany(Team, { foreignKey: 'leagueId' });
  Match.belongsTo(League, { foreignKey: 'leagueId' });
  League.hasMany(Match, { foreignKey: 'leagueId' });
  Match.belongsTo(Team, { as: 'homeTeam', foreignKey: 'homeTeamId' });
  Match.belongsTo(Team, { as: 'awayTeam', foreignKey: 'awayTeamId' });
  Team.hasMany(Match, { as: 'homeMatches', foreignKey: 'homeTeamId' });
  Team.hasMany(Match, { as: 'awayMatches', foreignKey: 'awayTeamId' });
  
  // New associations
  // User - Role (many-to-many)
  User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId', otherKey: 'roleId' });
  Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId', otherKey: 'userId' });
  
  // User - Team (many-to-many)
  User.belongsToMany(Team, { through: UserTeam, foreignKey: 'userId', otherKey: 'teamId' });
  Team.belongsToMany(User, { through: UserTeam, foreignKey: 'teamId', otherKey: 'userId' });
  
  // UserTeam relationships
  User.hasMany(UserTeam, { foreignKey: 'userId' });
  UserTeam.belongsTo(User, { foreignKey: 'userId' });
  Team.hasMany(UserTeam, { foreignKey: 'teamId' });
  UserTeam.belongsTo(Team, { foreignKey: 'teamId' });
  
  // Tournament relationships
  Tournament.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
  User.hasMany(Tournament, { as: 'createdTournaments', foreignKey: 'creatorId' });
  
  // User - Tournament (many-to-many)
  User.belongsToMany(Tournament, { through: UserTournament, foreignKey: 'userId', otherKey: 'tournamentId' });
  Tournament.belongsToMany(User, { through: UserTournament, foreignKey: 'tournamentId', otherKey: 'userId' });
  
  // Team - Tournament (many-to-many)
  Team.belongsToMany(Tournament, { through: TeamTournament, foreignKey: 'teamId', otherKey: 'tournamentId' });
  Tournament.belongsToMany(Team, { through: TeamTournament, foreignKey: 'tournamentId', otherKey: 'teamId' });
}

module.exports = { setupAssociations };
