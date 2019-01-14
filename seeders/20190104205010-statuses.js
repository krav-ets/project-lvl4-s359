module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TaskStatuses', [
    {
      id: 1,
      name: 'new',
      default: 'on',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'in process',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: 'testing',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: 'finished',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ], {}),

  down: queryInterface => queryInterface.bulkDelete('TaskStatuses', null, {}),
};
