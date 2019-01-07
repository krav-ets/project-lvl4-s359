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
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),

  down: queryInterface => queryInterface.dropTable('TagTask'),

};
