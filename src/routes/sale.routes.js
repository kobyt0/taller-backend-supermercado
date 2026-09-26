const { Router } = require('express');
const saleController = require('../controllers/sale.controller');

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Sales
 *     description: Ventas del supermercado (el total se calcula automáticamente)
 */

/**
 * @openapi
 * /api/sales:
 *   get:
 *     tags: [Sales]
 *     summary: Lista todas las ventas con su usuario y detalles
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: false
 *         description: Filtra las ventas de un usuario
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Sale' }
 *   post:
 *     tags: [Sales]
 *     summary: Registra una venta con sus productos
 *     description: >
 *       Crea la venta y sus detalles en una transacción, descuenta el stock de cada producto
 *       y calcula el total como la suma de quantity * price. El campo total no se recibe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SaleInput' }
 *     responses:
 *       201:
 *         description: Venta creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Sale' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/', saleController.getAll);
router.post('/', saleController.create);

/**
 * @openapi
 * /api/sales/{id}:
 *   get:
 *     tags: [Sales]
 *     summary: Obtiene una venta por id
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Sale' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   put:
 *     tags: [Sales]
 *     summary: Actualiza una venta
 *     description: >
 *       Permite cambiar userId y date. Si se envía details, se reemplazan todos los detalles,
 *       se ajusta el stock y se recalcula el total.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SaleUpdate' }
 *     responses:
 *       200:
 *         description: Venta actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Sale' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Sales]
 *     summary: Elimina una venta y sus detalles (reintegra el stock)
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Venta eliminada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Message' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', saleController.getById);
router.put('/:id', saleController.update);
router.delete('/:id', saleController.remove);

module.exports = router;
