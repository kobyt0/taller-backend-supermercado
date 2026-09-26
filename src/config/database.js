require('dotenv').config();
const { Sequelize } = require('sequelize');
const { Client } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'supermercado',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'postgres',
  logging: false,
});

/**
 * Crea la base de datos si no existe, para que el proyecto
 * se ejecute con `npm start` sin pasos manuales adicionales.
 */
async function ensureDatabase() {
  const client = new Client({ ...dbConfig, database: 'postgres' });
  try {
    await client.connect();
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      dbConfig.database,
    ]);
    if (rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbConfig.database.replace(/"/g, '""')}"`);
      console.log(`Base de datos "${dbConfig.database}" creada`);
    }
  } catch (error) {
    // Si no hay permisos para crearla, se intenta conectar igualmente a la base configurada.
    console.warn(`No se pudo verificar/crear la base de datos: ${error.message}`);
  } finally {
    await client.end().catch(() => {});
  }
}

module.exports = { sequelize, ensureDatabase, dbConfig };
