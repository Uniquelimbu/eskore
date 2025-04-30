const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class UserTournament extends Model {}

UserTournament.init({
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
  tournamentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tournaments',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('organizer', 'referee', 'participant'),
    allowNull: false,
    defaultValue: 'participant'
  }
}, {
  sequelize,
  modelName: 'UserTournament',
  tableName: 'user_tournaments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'tournamentId', 'role']
    }
  ]
});

module.exports = UserTournament;
