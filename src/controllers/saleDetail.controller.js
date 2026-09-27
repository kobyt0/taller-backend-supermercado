const { sequelize, Sale, SaleDetail, Product } = require('../models');
const HttpError = require('../utils/HttpError');
const {
  requireId,
  requireQuantity,
  optionalPrice,
  recalculateSaleTotal,
  reserveStock,
  releaseStock,
} = require('./helpers/sale.helpers');

// ✅ Atributos mapeados correctamente (BD en español -> JSON en inglés para Swagger)
const detailInclude = [
  { 
    model: Product, 
    as: 'product', 
    attributes: [
      'id', 
      ['nombre', 'name'], 
      ['precio', 'price']
    ] 
  },
  { model: Sale, as: 'sale', attributes: ['id', 'userId', 'date', 'total'] },
];

async function findDetailOr404(id, options = {}) {
  const detail = await SaleDetail.findByPk(id, options);
  if (!detail) throw new HttpError(404, `El detalle de venta con id ${id} no existe`);
  return detail;
}

async function findSaleOr404(id, transaction) {
  const sale = await Sale.findByPk(id, { transaction });
  if (!sale) throw new HttpError(404, `La venta con id ${id} no existe`);
  return sale;
}

/** GET /api/sale-details */
async function getAll(req, res, next) {
  try {
    const where = {};
    if (req.query.saleId !== undefined) where.saleId = requireId(req.query.saleId, 'saleId');
    if (req.query.productId !== undefined) {
      where.productId = requireId(req.query.productId, 'productId');
    }

    const details = await SaleDetail.findAll({ where, include: detailInclude, order: [['id', 'ASC']] });
    res.json(details);
  } catch (error) {
    next(error);
  }
}

/** GET /api/sale-details/:id */
async function getById(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const detail = await findDetailOr404(id, { include: detailInclude });
    res.json(detail);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/sale-details
 * Agrega un producto a una venta existente, descuenta stock y recalcula el total.
 */
async function create(req, res, next) {
  try {
    const saleId = requireId(req.body.saleId, 'saleId');
    const productId = requireId(req.body.productId, 'productId');
    const quantity = requireQuantity(req.body.quantity);
    const price = optionalPrice(req.body.price);

    const detailId = await sequelize.transaction(async (transaction) => {
      await findSaleOr404(saleId, transaction);
      const product = await reserveStock(productId, quantity, transaction);

      const detail = await SaleDetail.create(
        { saleId, productId, quantity, price: price ?? product.precio },
        { transaction }
      );
      await recalculateSaleTotal(saleId, transaction);
      return detail.id;
    });

    const detail = await findDetailOr404(detailId, { include: detailInclude });
    res.status(201).json(detail);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/sale-details/:id
 * Modifica producto, cantidad, precio o venta del detalle; ajusta el stock
 * y recalcula el total de las ventas afectadas.
 */
async function update(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const { saleId, productId, quantity, price } = req.body;

    await sequelize.transaction(async (transaction) => {
      const detail = await findDetailOr404(id, { transaction });
      const previousSaleId = detail.saleId;

      const changes = {
        saleId: saleId !== undefined ? requireId(saleId, 'saleId') : detail.saleId,
        productId: productId !== undefined ? requireId(productId, 'productId') : detail.productId,
        quantity: quantity !== undefined ? requireQuantity(quantity) : detail.quantity,
        price: price !== undefined ? optionalPrice(price) : detail.price,
      };

      if (changes.saleId !== previousSaleId) await findSaleOr404(changes.saleId, transaction);

      // Se devuelve el stock anterior y se descuenta el nuevo para mantener el inventario consistente.
      await releaseStock(detail.productId, detail.quantity, transaction);
      const product = await reserveStock(changes.productId, changes.quantity, transaction);

      // Si cambia el producto y no se indica precio, se toma el precio del nuevo producto.
      if (changes.productId !== detail.productId && price === undefined) changes.price = product.precio;
      if (changes.price === undefined || changes.price === null) changes.price = product.precio;

      await detail.update(changes, { transaction });

      await recalculateSaleTotal(changes.saleId, transaction);
      if (changes.saleId !== previousSaleId) await recalculateSaleTotal(previousSaleId, transaction);
    });

    const detail = await findDetailOr404(id, { include: detailInclude });
    res.json(detail);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/sale-details/:id
 * Elimina el detalle, reintegra el stock y recalcula el total de la venta.
 */
async function remove(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');

    const total = await sequelize.transaction(async (transaction) => {
      const detail = await findDetailOr404(id, { transaction });
      await releaseStock(detail.productId, detail.quantity, transaction);
      await detail.destroy({ transaction });
      return recalculateSaleTotal(detail.saleId, transaction);
    });

    res.json({ message: `Detalle de venta ${id} eliminado correctamente`, saleTotal: total });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
