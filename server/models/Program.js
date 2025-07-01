import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Faculty from './Faculty.js';

const Program = sequelize.define('Program', {
  name: { type: DataTypes.STRING, allowNull: false },
  director: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT }
}, {
  timestamps: false
});

// Foreign key to Faculty
Faculty.hasMany(Program, { foreignKey: 'facultyId' });
Program.belongsTo(Faculty, { foreignKey: 'facultyId' });

export default Program;