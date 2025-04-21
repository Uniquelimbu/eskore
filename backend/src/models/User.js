// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // ensures no duplicate emails
    validate: {
      isEmail: true
    }
  },
  // We'll store the hashed password
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // For role-based access control (e.g., "admin", "user")
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
