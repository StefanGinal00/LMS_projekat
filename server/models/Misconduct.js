import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Attempt from './Attempt.js';

const Misconduct = sequelize.define('Misconduct', {
  description: { type: DataTypes.TEXT, allowNull: false },
  date:        { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'misconducts',
  timestamps: false
});

Attempt.hasMany(Misconduct, { foreignKey: 'attemptId', as: 'Misconducts', onDelete: 'CASCADE' });
Misconduct.belongsTo(Attempt, { foreignKey: 'attemptId', as: 'Attempt' });

export default Misconduct;
