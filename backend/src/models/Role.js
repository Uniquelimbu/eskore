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

Role.associate = function(models) {
  Role.hasMany(models.UserRole, { foreignKey: 'roleId', as: 'userRoles' });
};

module.exports = Role;
