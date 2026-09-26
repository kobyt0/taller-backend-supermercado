const { sequelize } = require('../config/database');
const User = require('./User');
const Provider = require('./Provider');
const Product = require('./Product');
const Sale = require('./Sale');
const SaleDetail = require('./SaleDetail');

// Proveedor -> Productos
Provider.hasMany(Product, { foreignKey: 'providerId', as: 'products', onDelete: 'RESTRICT' });
Product.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider', onDelete: 'RESTRICT' });

// Usuario -> Ventas
User.hasMany(Sale, { foreignKey: 'userId', as: 'sales', onDelete: 'RESTRICT' });
Sale.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'RESTRICT' });

// Venta -> DetalleVenta (al eliminar la venta se eliminan sus detalles)
Sale.hasMany(SaleDetail, { foreignKey: 'saleId', as: 'details', onDelete: 'CASCADE' });
SaleDetail.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale', onDelete: 'CASCADE' });

// Producto -> DetalleVenta
Product.hasMany(SaleDetail, { foreignKey: 'productId', as: 'saleDetails', onDelete: 'RESTRICT' });
SaleDetail.belongsTo(Product, { foreignKey: 'productId', as: 'product', onDelete: 'RESTRICT' });

module.exports = {
  sequelize,
  User,
  Provider,
  Product,
  Sale,
  SaleDetail,
};
