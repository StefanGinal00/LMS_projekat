'use strict';
module.exports = {
  up: async (qi, Sequelize) => {
    await qi.addColumn('terms', 'date', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },
  down: async (qi) => {
    await qi.removeColumn('terms', 'date');
  }
};
