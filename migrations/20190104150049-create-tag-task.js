module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TagTask', {
    TagId: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    TaskId: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
  }),

  down: queryInterface => queryInterface.dropTable('TagTask'),

};
