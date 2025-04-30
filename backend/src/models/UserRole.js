const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class UserRole extends Model {}

UserRole.init({
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
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'UserRole',
  tableName: 'user_roles',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'roleId']
    }
  ]
});

module.exports = UserRole;
