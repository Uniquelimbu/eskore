const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class TeamTournament extends Model {}

TeamTournament.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
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
  status: {
    type: DataTypes.ENUM('registered', 'accepted', 'rejected', 'withdrawn'),
    defaultValue: 'registered'
  }
}, {
  sequelize,
  modelName: 'TeamTournament',
  tableName: 'team_tournaments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['teamId', 'tournamentId']
    }
  ]
});

module.exports = TeamTournament;
