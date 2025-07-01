import { DataTypes } from 'sequelize';
import sequelize     from '../config/database.js';
import Course        from './Courses.js';

const Notification = sequelize.define('Notification', {
  title:   DataTypes.STRING,
  content: DataTypes.TEXT,
  date:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  target:  { type: DataTypes.ENUM('all','current'), defaultValue: 'current' }
}, {
  tableName: 'notifications',
  timestamps: false
});

Course.hasMany(Notification, { foreignKey: 'courseId' });
Notification.belongsTo(Course, { foreignKey: 'courseId' });

export default Notification;
