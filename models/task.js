
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
  }, {
    scopes: {
      creator: id => ({
        where: {
          creator: id,
        },
      }),
      status: id => ({
        where: {
          status: id,
        },
      }),
      assignedTo: id => ({
        where: {
          assignedTo: id,
        },
      }),
    },
  });

  Task.associate = (models) => {
    Task.belongsToMany(models.Tag, { through: 'TagTask' });
    Task.belongsTo(models.TaskStatus, { as: 'Status', foreignKey: 'status', targetKey: 'id' });
    Task.belongsTo(models.User, { as: 'Creator', foreignKey: 'creator', targetKey: 'id' });
    Task.belongsTo(models.User, { as: 'AssignedTo', foreignKey: 'assignedTo', targetKey: 'id' });
  };

  return Task;
};
