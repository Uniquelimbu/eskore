const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt'); // Changed from bcryptjs to bcrypt
const sequelize = require('../config/db'); // Changed from database.js to match other models

class Athlete extends Model {
  // Method to check if password matches
  async validatePassword(password) {
    return await bcrypt.compare(password, this.passwordHash);
  }
}

Athlete.init({
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
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  position: {
    type: DataTypes.ENUM('FW', 'MD', 'DF', 'GK'),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true, // Only required for Nepal
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  facebookId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  modelName: 'Athlete',
  tableName: 'athletes',
  hooks: {
    beforeCreate: async (athlete) => {
      // Only hash password if it's provided (not OAuth)
      if (athlete.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        athlete.passwordHash = await bcrypt.hash(athlete.passwordHash, salt);
      }
    }
  }
});

module.exports = Athlete;
