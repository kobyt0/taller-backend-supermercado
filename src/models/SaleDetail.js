const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { decimalGetter } = require('./decimal');

const SaleDetail = sequelize.define(
  'SaleDetail',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    saleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'La cantidad debe ser un número entero' },
        min: { args: [1], msg: 'La cantidad debe ser al menos 1' },
      },
    },
    // Precio unitario del producto al momento de la venta.
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
    subtotal: {
      type: DataTypes.VIRTUAL,
      get() {
        const quantity = this.getDataValue('quantity');
        const price = this.getDataValue('price');
        if (quantity == null || price == null) return undefined;
        return Math.round(quantity * Number(price) * 100) / 100;
      },
    },
  },
  {
    tableName: 'sale_details',
  }
);

module.exports = SaleDetail;
