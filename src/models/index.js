const sequelize = require('../config/database');
const User = require('./User');
const Provider = require('./Provider');
const Product = require('./Product');
const Sale = require('./Sale');
const SaleDetail = require('./SaleDetail');

// Relaciones entre Proveedor y Producto
Provider.hasMany(Product, { foreignKey: 'providerId', as: 'productos' });
Product.belongsTo(Provider, { foreignKey: 'providerId', as: 'proveedor' });

// Relaciones entre Usuario y Venta
User.hasMany(Sale, { foreignKey: 'userId', as: 'sales' });
Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Relaciones entre Venta y Detalle de Venta
Sale.hasMany(SaleDetail, { foreignKey: 'saleId', as: 'details' });
SaleDetail.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });

// Relaciones entre Producto y Detalle de Venta
Product.hasMany(SaleDetail, { foreignKey: 'productId', as: 'saleDetails' });
SaleDetail.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  User,
  Provider,
  Product,
  Sale,
  SaleDetail,
};