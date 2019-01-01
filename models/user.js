import { encrypt } from '../lib/secure';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: 'Fill in the first name' },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: { msg: 'Fill in the last name' },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: { msg: 'Email already exists' },
      validate: {
        isEmail: { msg: 'Invalid email address' },
      },
    },
    passwordDigest: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.VIRTUAL,
      set(value) {
        this.setDataValue('passwordDigest', encrypt(value));
        this.setDataValue('password', value);
        return value;
      },
      validate: {
        len: {
          args: [1, +Infinity],
          msg: 'Fill in the password',
        },
      },
    },
  }, {
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
      // associate(models) {
      //  // associations can be defined here
      // },
    },
  });
  return User;
};
