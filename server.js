const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

// Importar modelos
require('./models/User');
require('./models/Provider');
require('./models/Product');

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const providerRoutes = require('./routes/providerRoutes');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Definir rutas principales
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/products', productRoutes);

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente.');

    await sequelize.sync({ alter: true });
    console.log('✅ Tablas e índices sincronizados.');

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
  }
}

main();