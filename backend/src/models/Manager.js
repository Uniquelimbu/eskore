const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/db');

class Manager extends Model {
  async validatePassword(password) {
    return await bcrypt.compare(password, this.passwordHash);
  }
}

Manager.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: true, // Allow null for OAuth users
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'teams',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Manager',
  tableName: 'managers',
  timestamps: true,
  hooks: {
    beforeCreate: async (manager) => {
      if (manager.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        manager.passwordHash = await bcrypt.hash(manager.passwordHash, salt);
      }
    }
  }
});

module.exports = Manager;
