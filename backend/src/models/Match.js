// src/models/Match.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Match = sequelize.define('Match', {
  homeTeamId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  awayTeamId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  homeScore: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  awayScore: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'scheduled'
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  leagueId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'matches',
  timestamps: true
});

// NOTE: Associations are now defined in src/models/associations.js

module.exports = Match;
