/**
 * Inserta datos de ejemplo (proveedores, usuarios y productos) para poder
 * probar ventas desde Swagger. Solo inserta si las tablas están vacías.
 * Uso: npm run seed
 */
require('dotenv').config();
const { ensureDatabase } = require('../config/database');
const { sequelize, Provider, User, Product } = require('../models');

async function seed() {
  await ensureDatabase();
  await sequelize.sync();

  if ((await Provider.count()) === 0) {
    await Provider.bulkCreate([
      { name: 'Distribuidora Andina', phone: '3001234567', email: 'ventas@andina.com', city: 'Bogotá' },
      { name: 'Lácteos del Valle', phone: '3109876543', email: 'contacto@lacteosvalle.com', city: 'Cali' },
    ]);
    console.log('Proveedores de ejemplo creados');
  }

  if ((await User.count()) === 0) {
    await User.bulkCreate([
      { name: 'Ana Pérez', email: 'ana@marketsoft.com', role: 'cajero' },
      { name: 'Carlos Gómez', email: 'carlos@marketsoft.com', role: 'administrador' },
    ]);
    console.log('Usuarios de ejemplo creados');
  }

  if ((await Product.count()) === 0) {
    const [andina, valle] = await Provider.findAll({ order: [['id', 'ASC']], limit: 2 });
    await Product.bulkCreate(
      [
        { name: 'Arroz 1kg', description: 'Arroz blanco', price: 4500, stock: 100, providerId: andina.id },
        { name: 'Aceite 1L', description: 'Aceite vegetal', price: 12000, stock: 50, providerId: andina.id },
        { name: 'Leche 1L', description: 'Leche entera', price: 3300, stock: 80, providerId: valle.id },
        { name: 'Queso 500g', description: 'Queso campesino', price: 9800, stock: 30, providerId: valle.id },
      ],
      { validate: true }
    );
    console.log('Productos de ejemplo creados');
  }

  console.log('Seed finalizado');
}

seed()
  .catch((error) => {
    console.error('Error ejecutando el seed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
