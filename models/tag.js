export default (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      unique: { msg: 'Tag already exists' },
      validate: {
        len: {
          args: [1, 30],
          msg: 'Tag length should be between 1 and 30',
        },
      },
    },
  }, {});

  Tag.associate = (models) => {
    Tag.belongsToMany(models.Task, { through: 'TagTask' });
  };

  return Tag;
};
