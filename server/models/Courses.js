import { DataTypes } from 'sequelize';
import sequelize     from '../config/database.js';
import Program       from './Program.js';

const Course = sequelize.define('Course', {
  name:        DataTypes.STRING,
  description: DataTypes.TEXT,
  syllabus:    DataTypes.TEXT,
  materials:   DataTypes.JSON,
  ects: {
    type:      DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 6
  }
}, {
  tableName: 'courses'
});

Program.hasMany(Course, { foreignKey: 'programId' });
Course.belongsTo(Program, { foreignKey: 'programId' });

export default Course;
