// Central point for model loading to prevent circular dependencies

// First import all models
const User = require('./User');
const Team = require('./Team');
const League = require('./League');
const Match = require('./Match');
const Role = require('./Role');
const UserRole = require('./UserRole');
const UserTeam = require('./UserTeam');
const Tournament = require('./Tournament');
const UserTournament = require('./UserTournament');
const TeamTournament = require('./TeamTournament');
const UserMatch = require('./UserMatch');
const Formation = require('./Formation');
const Manager = require('./Manager'); // Add this import

// Then set up associations
const { setupAssociations } = require('./associations');
setupAssociations();

module.exports = {
  User,
  Team,
  League,
  Match,
  Role,
  UserRole,
  UserTeam,
  Tournament,
  UserTournament,
  TeamTournament,
  UserMatch,
  Formation,
  Manager  // Add this export
};
