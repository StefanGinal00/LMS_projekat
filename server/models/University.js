import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const University = sequelize.define('University', {
  name:        { type: DataTypes.STRING, allowNull: false },
  location:    { type: DataTypes.STRING },
  contact:     { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  rector:      { type: DataTypes.STRING }
}, {
  tableName: 'university',
  timestamps: false
});

export default University;
