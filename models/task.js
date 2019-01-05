
export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: 'Fill in the name task' },
      },
    },
    description: DataTypes.STRING,
    status: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: { msg: 'Fill in the status' },
      },
    },
    creator: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: { msg: 'Fill in the creator' },
      },
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: { msg: 'Fill in the assignedTo' },
      },
    },
  }, {});

  Task.associate = (models) => {
    Task.belongsToMany(models.Tag, { through: 'TagTask' });
  };

  return Task;
};
