'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('attempts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      examDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      passed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      grade: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      enrollmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'enrollments', key: 'id' },
        onDelete: 'CASCADE'
      }
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb4'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('attempts');
  }
};
