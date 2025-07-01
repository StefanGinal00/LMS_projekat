import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import {User} from './User.js';
import Course from './Courses.js'; 

const Enrollment = sequelize.define('Enrollment', {
  enrollmentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  current: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'enrollments',
  timestamps: false      
});

User.hasMany(Enrollment,    { foreignKey: 'studentId' });
Enrollment.belongsTo(User,  { foreignKey: 'studentId' });

Course.hasMany(Enrollment,    { foreignKey: 'programId' }); 
Enrollment.belongsTo(Course,  { foreignKey: 'programId' });

export default Enrollment;
