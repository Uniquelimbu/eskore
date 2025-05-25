'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
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
    playingStyle: {
      type: DataTypes.ENUM(
        'possession', 
        'counter-attack', 
        'high-press', 
        'defensive', 
        'balanced'
      ),
      allowNull: true
    },
    preferredFormation: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Experience in years'
    },
    profileImageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Manager',
    tableName: 'managers',
    timestamps: true
  });
  
  return Manager;
};
