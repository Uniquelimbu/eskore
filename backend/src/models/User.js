// src/models/User.js
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/db');

class User extends Model {
  // Method to validate password
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Method to check if user has a specific role
  async hasRole(roleName) {
    const roles = await this.getRoles();
    return roles.some(role => role.name === roleName);
  }

  // Method to check if user has any of the provided roles
  async hasAnyRole(roleNames) {
    const roles = await this.getRoles();
    const userRoleNames = roles.map(role => role.name);
    return roleNames.some(role => userRoleNames.includes(role));
  }

  // Method to check if user is part of a team with a specific role
  async isTeamMember(teamId, role = null) {
    const teamMemberships = await this.getUserTeams({
      where: { 
        teamId,
        ...(role ? { role } : {})
      }
    });
    return teamMemberships.length > 0;
  }

  // Method to get all user's teams
  async getTeams() {
    const userTeams = await this.getUserTeams({
      include: [{ model: sequelize.models.Team }]
    });
    return userTeams.map(ut => ut.Team);
  }

  // Method to get user's tournaments
  async getTournaments(role = null) {
    const where = role ? { role } : {};
    const userTournaments = await this.getUserTournaments({
      where,
      include: [{ model: sequelize.models.Tournament }]
    });
    return userTournaments.map(ut => ut.Tournament);
  }
}
  
User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  middleName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  hooks: {
    // Hook to hash password before create if not already hashed
    beforeCreate: async (user) => {
      if (user.password && !user.password.startsWith('$2')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    // Hook to hash password before update if changed and not already hashed
    beforeUpdate: async (user) => {
      if (user.changed('password') && !user.password.startsWith('$2')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

module.exports = User;
