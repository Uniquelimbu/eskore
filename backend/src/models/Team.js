// src/models/Team.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Team extends Model {
  // Static associate method
  static associate(models) {
    // Team can have many Formations
    this.hasMany(models.Formation, {
      foreignKey: 'teamId',
      as: 'formations' // This alias should be unique for Team's associations
    });
    // Define association to User through UserTeam
    this.belongsToMany(models.User, {
      through: models.UserTeam, // Junction table
      foreignKey: 'teamId',    // Foreign key in UserTeam that points to Team
      otherKey: 'userId',      // Foreign key in UserTeam that points to User
      as: 'Users'              // Alias for the association (team.Users)
    });
    // Team has many UserTeam entries (optional, but can be useful for direct access)
    this.hasMany(models.UserTeam, {
      foreignKey: 'teamId',
      as: 'TeamMemberships'    // Alias for team.getTeamMemberships()
    });
    // Add other associations for Team here if needed
    // e.g., this.belongsToMany(models.User, { through: models.UserTeam, foreignKey: 'teamId', otherKey: 'userId' });
    // this.hasMany(models.UserTeam, { foreignKey: 'teamId' });
    // this.hasMany(models.Match, { as: 'homeMatches', foreignKey: 'homeTeamId' });
    // this.hasMany(models.Match, { as: 'awayMatches', foreignKey: 'awayTeamId' });
    // this.belongsToMany(models.Tournament, { through: models.TeamTournament, foreignKey: 'teamId', otherKey: 'tournamentId' });
    // this.hasMany(models.TeamTournament, { foreignKey: 'teamId' });
    // this.hasMany(models.UserMatch, { foreignKey: 'teamId' });
  }
}

Team.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true, // Teams might not always have emails
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  abbreviation: {
    type: DataTypes.STRING(3),
    allowNull: true
  },
  foundedYear: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public',
    allowNull: false
  },
  teamIdentifier: {
    type: DataTypes.STRING(7),  // Format: AAA-NNN (7 characters)
    allowNull: true,
    unique: true
  },
  // Identifies the user that originally created the team. This mirrors the NOT NULL
  // `creatorId` column that already exists in the database migration.
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  sequelize,
  modelName: 'Team',
  tableName: 'teams',
  timestamps: true
});

module.exports = Team;
