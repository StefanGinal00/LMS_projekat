import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import {User} from './User.js';

const Thesis = sequelize.define('Thesis', {
  title:         { type: DataTypes.STRING,  allowNull: false },
  grade:         { type: DataTypes.INTEGER, allowNull: true },
  dateDefended:  { type: DataTypes.DATE,    allowNull: true }
}, {
  tableName: 'theses',
  timestamps: false
});

User.hasOne(Thesis, { foreignKey: 'studentId', as: 'Thesis', onDelete: 'CASCADE' });
Thesis.belongsTo(User, { foreignKey: 'studentId', as: 'Student' });

export default Thesis;
