// src/models/Team.js
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/db');

class Team extends Model {
  // Method to check if password matches
  async validatePassword(password) {
    return await bcrypt.compare(password, this.passwordHash);
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
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: true, // Allow null for OAuth or non-login teams
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
  }
}, {
  sequelize,
  modelName: 'Team',
  tableName: 'teams',
  timestamps: true,
  hooks: {
    beforeCreate: async (team) => {
      if (team.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        team.passwordHash = await bcrypt.hash(team.passwordHash, salt);
      }
    }
  }
});

module.exports = Team;
