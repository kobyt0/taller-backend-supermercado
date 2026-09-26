require('dotenv').config();
const app = require('./src/app');
const { ensureDatabase } = require('./src/config/database');
const { sequelize } = require('./src/models');

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await ensureDatabase();
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida');

    // Crea las tablas y relaciones definidas en los modelos si no existen.
    await sequelize.sync();
    console.log('Modelos sincronizados');

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
      console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

start();
