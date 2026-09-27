const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

// 1. IMPORTAR LA CONFIGURACIÓN JS DE SWAGGER (Ajusta la ruta si no está en src/config/)
const swaggerSpec = require('./src/config/swagger'); 

const { sequelize } = require('./src/models');

dotenv.config();

// Capturar errores no manejados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception thrown:', err);
});

// Importar rutas
const userRoutes = require('./src/routes/userRoutes');
const providerRoutes = require('./src/routes/providerRoutes');
const productRoutes = require('./src/routes/productRoutes');
const saleRoutes = require('./src/routes/sale.routes');
const saleDetailRoutes = require('./src/routes/saleDetail.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 2. CONFIGURAR RUTA INTERACTIVA DE SWAGGER UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Endpoints API
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/sale-details', saleDetailRoutes);

// Middleware global para manejo de errores en Express
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Error interno del servidor',
  });
});

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');

    await sequelize.sync();
    console.log('✅ Tablas e índices sincronizados.');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📄 Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
    });

    server.on('error', (error) => {
      console.error('❌ Error en el servidor Express:', error);
    });

  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
  }
}

main();