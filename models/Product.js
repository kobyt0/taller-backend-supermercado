const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Provider = require('./Provider');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  categoria: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});


Product.belongsTo(Provider, { foreignKey: 'providerId', as: 'proveedor' });
Provider.hasMany(Product, { foreignKey: 'providerId', as: 'productos' });

module.exports = Product;