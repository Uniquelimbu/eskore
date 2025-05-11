'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * UserMatch model
 * Represents a user's participation in a match, including their stats and team
 */
class UserMatch extends Model {}

UserMatch.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'matches',
      key: 'id'
    }
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  stats: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'player'
  },
  minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'UserMatch',
  tableName: 'user_matches',
  timestamps: true
});

module.exports = UserMatch;
