const { Router } = require('express');
const saleRoutes = require('./sale.routes');
const saleDetailRoutes = require('./saleDetail.routes');

const router = Router();

// Módulo transaccional
router.use('/sales', saleRoutes);
router.use('/sale-details', saleDetailRoutes);

// Registrar aquí las rutas de products, providers y users:
// router.use('/products', productRoutes);
// router.use('/providers', providerRoutes);
// router.use('/users', userRoutes);

module.exports = router;
