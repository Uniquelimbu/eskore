const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Tournament extends Model {}

Tournament.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'registration', 'active', 'completed', 'cancelled'),
    defaultValue: 'draft'
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Tournament',
  tableName: 'tournaments',
  timestamps: true
});

module.exports = Tournament;
