'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'surname', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Prezime'
    });
    await queryInterface.addColumn('users', 'indexNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'yearOfEnrollment', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'surname');
    await queryInterface.removeColumn('users', 'indexNumber');
    await queryInterface.removeColumn('users', 'yearOfEnrollment');
  }
};