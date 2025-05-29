'use strict';

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const log = require('../utils/log');

class Manager extends Model {
  static associate(models) {
    // Define association to User
    Manager.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    // Define association to Team
    Manager.belongsTo(models.Team, {
      foreignKey: 'teamId',
      as: 'team'
    });
  }
}

Manager.init({
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
    onDelete: 'CASCADE',
    unique: true // Each user can have only one manager record
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teams',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  playingStyle: {
    type: DataTypes.ENUM(
      'possession', 
      'counter-attack', 
      'high-press', 
      'defensive', 
      'balanced'
    ),
    allowNull: false,
    defaultValue: 'balanced'
  },
  preferredFormation: {
    type: DataTypes.STRING(50), // Changed from JSON to STRING for simpler storage
    allowNull: true,
    defaultValue: '4-3-3',
    comment: 'Manager\'s preferred formation preset (e.g. "4-3-3", "4-4-2")'
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 50
    }
  }
}, {
  sequelize,
  modelName: 'Manager',
  tableName: 'managers',
  timestamps: true,
  hooks: {
    beforeValidate: (manager) => {
      // Ensure experience is always a number
      if (manager.experience === null || manager.experience === undefined) {
        manager.experience = 0;
        log.info(`MANAGER MODEL: Setting null/undefined experience to 0 for manager ${manager.id || 'new'}`);
      } else if (typeof manager.experience === 'string') {
        const parsed = parseInt(manager.experience, 10);
        manager.experience = isNaN(parsed) ? 0 : parsed;
        log.info(`MANAGER MODEL: Converted string experience "${manager.experience}" to number ${parsed} for manager ${manager.id || 'new'}`);
      }
      
      // Ensure playingStyle has a valid value
      if (!manager.playingStyle) {
        manager.playingStyle = 'balanced';
        log.info(`MANAGER MODEL: Setting default playing style for manager ${manager.id || 'new'}`);
      }
      
      // Ensure preferredFormation has a valid value
      if (!manager.preferredFormation) {
        manager.preferredFormation = '4-3-3';
        log.info(`MANAGER MODEL: Setting default formation for manager ${manager.id || 'new'}`);
      }
    },
    afterCreate: (manager) => {
      log.info(`MANAGER MODEL: Created manager record ID ${manager.id} for user ${manager.userId}, team ${manager.teamId}, experience: ${manager.experience}`);
    }
  }
});

module.exports = Manager;
