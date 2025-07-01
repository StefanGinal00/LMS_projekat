import { DataTypes } from 'sequelize';
import sequelize     from '../config/database.js';
import Program       from './Program.js';

const Course = sequelize.define('Course', {
  name:        DataTypes.STRING,
  description: DataTypes.TEXT,
  syllabus:    DataTypes.TEXT,    // silabus
  materials:   DataTypes.JSON     // niz URL-ova ili objekata
}, {
  tableName: 'courses'
});

Program.hasMany(Course, { foreignKey: 'programId' });
Course.belongsTo(Program, { foreignKey: 'programId' });

export default Course;
