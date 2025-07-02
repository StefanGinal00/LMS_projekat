import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Enrollment from './Enrollment.js';

const Attempt = sequelize.define('Attempt', {
  examDate: { type: DataTypes.DATE,   defaultValue: DataTypes.NOW },
  passed:   { type: DataTypes.BOOLEAN, defaultValue: false },
  grade:    { type: DataTypes.INTEGER },
  points:   {
    type:      DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'attempts',
  timestamps: false
});

Enrollment.hasMany(Attempt, { foreignKey: 'enrollmentId', as: 'Attempts' });
Attempt.belongsTo(Enrollment, { foreignKey: 'enrollmentId', as: 'Enrollment' });

export default Attempt;
