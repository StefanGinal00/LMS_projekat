import { DataTypes } from 'sequelize';
import sequelize       from '../config/database.js';
import { User }        from './User.js';
import Course          from './Courses.js';

const CourseInstructor = sequelize.define('CourseInstructor', {
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Course, key: 'id' }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' }
  }
}, {
  tableName: 'course_instructors',
  timestamps: false
});

// M:N relacija između Course i User preko CourseInstructor
Course.belongsToMany(User, {
  through: CourseInstructor,
  foreignKey: 'courseId',
  otherKey: 'userId'
});
User.belongsToMany(Course, {
  through: CourseInstructor,
  foreignKey: 'userId',
  otherKey: 'courseId'
});

export default CourseInstructor;
