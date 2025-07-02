// server/models/EvaluationInstrument.js
import { DataTypes } from 'sequelize';
import sequelize       from '../config/database.js';
import Course          from './Courses.js';

const EvaluationInstrument = sequelize.define('EvaluationInstrument', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('project','test','kolokvijum'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  maxScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  }
}, {
  tableName: 'evaluation_instruments',
  timestamps: true
});

// Asocijacije 1:N: Course ↔ Instruments
Course.hasMany(EvaluationInstrument, {
  foreignKey: 'courseId',
  onDelete: 'CASCADE'
});
EvaluationInstrument.belongsTo(Course, {
  foreignKey: 'courseId',
  onDelete: 'CASCADE'
});

export default EvaluationInstrument;
