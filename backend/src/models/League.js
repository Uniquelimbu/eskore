// src/models/League.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const League = sequelize.define('League', {
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
  tableName: 'leagues',
  timestamps: true
});

module.exports = League;
