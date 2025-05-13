const User = require('./User');
const Team = require('./Team');
const Match = require('./Match');
const UserMatch = require('./UserMatch');
const Formation = require('./Formation');
const League = require('./League');
const Role = require('./Role');
const Tournament = require('./Tournament');
const UserRole = require('./userRole');
const UserTeam = require('./UserTeam');
const UserTournament = require('./UserTournament');
const TeamTournament = require('./TeamTournament');

// Create models object first
const models = {
  User,
  Team,
  Match,
  UserMatch,
  Formation,
  League,
  Role,
  Tournament,
  UserRole,
  UserTeam,
  UserTournament,
  TeamTournament
};

// Import associations
const { setupAssociations } = require('./associations');

// Setup all associations defined in associations.js (mostly many-to-many through tables)
setupAssociations();

// Setup individual model associations (one-to-one, one-to-many defined in model files)
// Object.values(models).forEach(model => { // A more generic way to call associate
//   if (model.associate) {
//     model.associate(models);
//   }
// });
// For clarity, explicit calls are also fine:
if (typeof User.associate === 'function') User.associate(models);
if (typeof Team.associate === 'function') Team.associate(models);
if (typeof Formation.associate === 'function') Formation.associate(models);
if (typeof Role.associate === 'function') Role.associate(models);
// Add other models that have an .associate method
if (typeof UserTeam.associate === 'function') UserTeam.associate(models);
if (typeof UserRole.associate === 'function') UserRole.associate(models);
// Match, League, Tournament, etc., if they have .associate methods

// Export the models object
module.exports = models;
