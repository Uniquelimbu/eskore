'use strict';

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const log = require('../utils/log');

class Player extends Model {
  static associate(models) {
    // Define association to User
    Player.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  }
}

Player.init({
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
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  position: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  preferredFoot: {
    type: DataTypes.ENUM('left', 'right', 'both'),
    allowNull: true
  },
  jerseyNumber: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  nationality: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  profileImageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Player',
  tableName: 'players',
  timestamps: true
});

// Log that the Player model is defined
log.info('Player model defined');

module.exports = Player;