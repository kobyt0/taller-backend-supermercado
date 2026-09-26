const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre es obligatorio' },
      },
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: { msg: 'El email ya está registrado' },
      validate: {
        isEmail: { msg: 'El email no es válido' },
      },
    },
    role: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'cajero',
      validate: {
        notEmpty: { msg: 'El rol es obligatorio' },
      },
    },
  },
  {
    tableName: 'users',
  }
);

module.exports = User;
