const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { decimalGetter } = require('./decimal');

const Sale = sequelize.define(
  'Sale',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: { msg: 'La fecha no es válida' },
      },
    },
    // Se calcula automáticamente como la suma de quantity * price de sus detalles.
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      get: decimalGetter('total'),
      validate: {
        min: { args: [0], msg: 'El total no puede ser negativo' },
      },
    },
  },
  {
    tableName: 'sales',
  }
);

module.exports = Sale;
