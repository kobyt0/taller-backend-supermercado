const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { decimalGetter } = require('./decimal');

const Product = sequelize.define(
  'Product',
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get: decimalGetter('price'),
      validate: {
        isDecimal: { msg: 'El precio debe ser numérico' },
        greaterThanZero(value) {
          if (Number(value) <= 0) throw new Error('El precio debe ser mayor a 0');
        },
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'El stock debe ser un número entero' },
        min: { args: [0], msg: 'El stock no puede ser negativo' },
      },
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'products',
  }
);

module.exports = Product;
