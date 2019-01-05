export default (sequelize, DataTypes) => {
  const TaskStatus = sequelize.define('TaskStatus', {
    name: {
      type: DataTypes.STRING,
      unique: { msg: 'This status already exists' },
      validate: {
        notEmpty: { msg: 'Fill in the status name' },
      },
    },
  }, {});
    // associations can be defined here

  return TaskStatus;
};
