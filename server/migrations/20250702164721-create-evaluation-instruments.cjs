'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1) Kreiramo tabelu evaluation_instruments
    await queryInterface.createTable('evaluation_instruments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('project','test','kolokvijum'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      maxScore: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb4'
    });
  },

  async down (queryInterface, Sequelize) {
    // 2) Rollback briše tabelu i ENUM tip
    await queryInterface.dropTable('evaluation_instruments');
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_evaluation_instruments_type\";");
  }
};
