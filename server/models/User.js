import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  surname: {                          // Dodaj ovo
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  indexNumber: {                      // Dodaj ovo
    type: DataTypes.STRING,
    allowNull: true
  },
  yearOfEnrollment: {                 // Dodaj ovo
    type: DataTypes.INTEGER,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('student', 'professor', 'admin'),
    defaultValue: 'student'
  }
}, {
  timestamps: true,
  tableName: 'users'
});

export { User };
