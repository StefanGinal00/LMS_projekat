import { DataTypes } from 'sequelize';
import sequelize       from '../config/database.js';
import {User}            from './User.js';
import Course          from './Courses.js';

const CourseInstructor = sequelize.define('CourseInstructor', {
  // bez dodatnih polja, služi samo kao „through” tabela
}, {
  tableName: 'course_instructors',
  timestamps: false
});

// Postavljanje M:N relacije (many to many)
// Jedan kurs može imati više nastavnika. 
// Jedan nastavnik može držati više kurseva.

Course.belongsToMany(User,   { through: CourseInstructor, foreignKey: 'courseId' });
User.belongsToMany(Course, { through: CourseInstructor, foreignKey: 'userId' });

export default CourseInstructor;
