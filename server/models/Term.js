import { DataTypes } from 'sequelize';
import sequelize       from '../config/database.js';
import Course          from './Courses.js';

const Term = sequelize.define('Term', {
  // ručno definišemo i courseId
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Course,
      key: 'id'
    }
    // napomena: onDelete će zadati u association niže
  },
  sessionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'terms',
  timestamps: false
});

// Association sa eksplicitnim onDelete
Course.hasMany(Term, {
  foreignKey: 'courseId',
  onDelete: 'CASCADE',      // kad obrišem Course, brišu se i Term redovi
  hooks: true               // neophodno za CASCADE pri sync/promise
});
Term.belongsTo(Course, {
  foreignKey: 'courseId',
  onDelete: 'CASCADE'
});

export default Term;
