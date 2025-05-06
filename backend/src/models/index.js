const User = require('./User');
const Team = require('./Team');
const Match = require('./Match');

// Import associations
const { setupAssociations } = require('./associations');

// Setup all associations
setupAssociations();

module.exports = {
  User,
  Team,
  Match
};
