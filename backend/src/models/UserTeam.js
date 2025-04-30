const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class UserTeam extends Model {}

UserTeam.init({
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
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('owner', 'manager', 'athlete', 'coach'),
    allowNull: false,
    defaultValue: 'athlete'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'active'
  }
}, {
  sequelize,
  modelName: 'UserTeam',
  tableName: 'user_teams',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'teamId', 'role']
    }
  ]
});

module.exports = UserTeam;
