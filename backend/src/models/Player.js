'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
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
      allowNull: false
    },
    position: DataTypes.STRING(50),
    height: DataTypes.DECIMAL(5, 2),
    weight: DataTypes.DECIMAL(5, 2),
    preferredFoot: DataTypes.ENUM('left', 'right', 'both'),
    jerseyNumber: DataTypes.STRING(10)
  }, {
    sequelize,
    modelName: 'Player',
    tableName: 'players',
    underscored: false,
    timestamps: true
  });
  
  return Player;
};
