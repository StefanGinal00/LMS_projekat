import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('lms_university', 'root', 'root', {
  host: '127.0.0.1',
  dialect: 'mysql',
  logging: false
});

export default sequelize;