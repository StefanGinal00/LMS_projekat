import { DataTypes } from 'sequelize';
import sequelize       from '../config/database.js';
import Course          from './Courses.js';

const Term = sequelize.define('Term', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Course, key: 'id' }
  },
  sessionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'terms',
  timestamps: false
});

Course.hasMany(Term, { foreignKey: 'courseId', onDelete: 'CASCADE', hooks: true });
Term.belongsTo(Course,   { foreignKey: 'courseId', onDelete: 'CASCADE' });

export default Term;
