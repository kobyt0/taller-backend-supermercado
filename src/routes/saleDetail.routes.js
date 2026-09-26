const { Router } = require('express');
const saleDetailController = require('../controllers/saleDetail.controller');

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: SaleDetails
 *     description: Detalles (líneas de producto) de cada venta
 */

/**
 * @openapi
 * /api/sale-details:
 *   get:
 *     tags: [SaleDetails]
 *     summary: Lista los detalles de venta
 *     parameters:
 *       - name: saleId
 *         in: query
 *         required: false
 *         description: Filtra por venta
 *         schema: { type: integer }
 *       - name: productId
 *         in: query
 *         required: false
 *         description: Filtra por producto
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de detalles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/SaleDetailWithSale' }
 *   post:
 *     tags: [SaleDetails]
 *     summary: Agrega un producto a una venta existente
 *     description: Descuenta el stock del producto y recalcula el total de la venta.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SaleDetailInput' }
 *     responses:
 *       201:
 *         description: Detalle creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SaleDetailWithSale' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/', saleDetailController.getAll);
router.post('/', saleDetailController.create);

/**
 * @openapi
 * /api/sale-details/{id}:
 *   get:
 *     tags: [SaleDetails]
 *     summary: Obtiene un detalle de venta por id
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Detalle encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SaleDetailWithSale' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   put:
 *     tags: [SaleDetails]
 *     summary: Actualiza un detalle de venta
 *     description: Ajusta el stock según el cambio y recalcula el total de la(s) venta(s) afectada(s).
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SaleDetailUpdate' }
 *     responses:
 *       200:
 *         description: Detalle actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SaleDetailWithSale' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [SaleDetails]
 *     summary: Elimina un detalle de venta
 *     description: Reintegra el stock y recalcula el total de la venta.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Detalle eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Detalle de venta 3 eliminado correctamente' }
 *                 saleTotal: { type: number, example: 9000 }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', saleDetailController.getById);
router.put('/:id', saleDetailController.update);
router.delete('/:id', saleDetailController.remove);

module.exports = router;
