const User = require('./User');
const Team = require('./Team');
const Match = require('./Match');
const UserMatch = require('./UserMatch'); // Add this line

// Import associations
const { setupAssociations } = require('./associations');

// Setup all associations
setupAssociations();

module.exports = {
  User,
  Team,
  Match,
  UserMatch // Add this line
};
