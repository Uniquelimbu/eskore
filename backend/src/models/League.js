const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class League extends Model {}

League.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'League',
  tableName: 'leagues',
  timestamps: true
});

module.exports = League;
