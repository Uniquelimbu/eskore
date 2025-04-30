const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Role extends Model {}

Role.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Role',
  tableName: 'roles',
  timestamps: true
});

module.exports = Role;
