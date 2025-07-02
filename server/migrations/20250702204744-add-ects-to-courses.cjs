'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('courses', 'ects', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 6
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('courses', 'ects');
  }
};

