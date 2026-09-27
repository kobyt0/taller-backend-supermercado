const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SaleDetail = sequelize.define('SaleDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'La cantidad debe ser un número entero' },
      min: { args: [1], msg: 'La cantidad debe ser al menos 1' },
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
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
}, {
  tableName: 'sale_details',
  timestamps: true,
});

module.exports = SaleDetail;