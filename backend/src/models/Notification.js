const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Notification extends Model {}

Notification.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Teams',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['join_request', 'invitation', 'request_accepted', 'request_denied', 'team_announcement']]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  senderUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'unread',
    validate: {
      isIn: [['unread', 'read', 'archived']]
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications',
  timestamps: true
});

module.exports = Notification;
