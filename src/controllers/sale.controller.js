const { sequelize, Sale, SaleDetail, Product, User } = require('../models');
const HttpError = require('../utils/HttpError');
const {
  requireId,
  parseDetailsInput,
  calculateTotal,
  releaseStock,
  buildSaleLines,
} = require('./helpers/sale.helpers');

const saleInclude = [
  { model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] },
  {
    model: SaleDetail,
    as: 'details',
    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }],
  },
];

async function findSaleOr404(id, options = {}) {
  const sale = await Sale.findByPk(id, options);
  if (!sale) throw new HttpError(404, `La venta con id ${id} no existe`);
  return sale;
}

async function findUserOr404(id, transaction) {
  const user = await User.findByPk(id, { transaction });
  if (!user) throw new HttpError(404, `El usuario con id ${id} no existe`);
  return user;
}

/** GET /api/sales */
async function getAll(req, res, next) {
  try {
    const where = {};
    if (req.query.userId !== undefined) where.userId = requireId(req.query.userId, 'userId');

    const sales = await Sale.findAll({
      where,
      include: saleInclude,
      order: [
        ['date', 'DESC'],
        ['id', 'DESC'],
        [{ model: SaleDetail, as: 'details' }, 'id', 'ASC'],
      ],
    });
    res.json(sales);
  } catch (error) {
    next(error);
  }
}

/** GET /api/sales/:id */
async function getById(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const sale = await findSaleOr404(id, {
      include: saleInclude,
      order: [[{ model: SaleDetail, as: 'details' }, 'id', 'ASC']],
    });
    res.json(sale);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/sales
 * Crea la venta con sus detalles, descuenta stock y calcula el total automáticamente.
 */
async function create(req, res, next) {
  try {
    const userId = requireId(req.body.userId, 'userId');
    const items = parseDetailsInput(req.body.details);

    const saleId = await sequelize.transaction(async (transaction) => {
      await findUserOr404(userId, transaction);
      const lines = await buildSaleLines(items, transaction);

      const sale = await Sale.create(
        {
          userId,
          date: req.body.date ?? new Date(),
          total: calculateTotal(lines),
        },
        { transaction }
      );
      await SaleDetail.bulkCreate(
        lines.map((line) => ({ ...line, saleId: sale.id })),
        { transaction, validate: true }
      );
      return sale.id;
    });

    const sale = await findSaleOr404(saleId, {
      include: saleInclude,
      order: [[{ model: SaleDetail, as: 'details' }, 'id', 'ASC']],
    });
    res.status(201).json(sale);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/sales/:id
 * Permite cambiar usuario y fecha. Si se envían `details`, reemplaza los detalles
 * existentes (reintegrando y descontando stock) y recalcula el total.
 */
async function update(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');
    const { userId, date, details } = req.body;
    const items = details !== undefined ? parseDetailsInput(details) : null;

    await sequelize.transaction(async (transaction) => {
      const sale = await findSaleOr404(id, { transaction });
      const changes = {};

      if (userId !== undefined) {
        changes.userId = requireId(userId, 'userId');
        await findUserOr404(changes.userId, transaction);
      }
      if (date !== undefined) changes.date = date;

      if (items) {
        const previous = await SaleDetail.findAll({ where: { saleId: id }, transaction });
        for (const detail of previous) {
          await releaseStock(detail.productId, detail.quantity, transaction);
        }
        await SaleDetail.destroy({ where: { saleId: id }, transaction });

        const lines = await buildSaleLines(items, transaction);
        await SaleDetail.bulkCreate(
          lines.map((line) => ({ ...line, saleId: id })),
          { transaction, validate: true }
        );
        changes.total = calculateTotal(lines);
      }

      await sale.update(changes, { transaction });
    });

    const sale = await findSaleOr404(id, {
      include: saleInclude,
      order: [[{ model: SaleDetail, as: 'details' }, 'id', 'ASC']],
    });
    res.json(sale);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/sales/:id
 * Elimina la venta y sus detalles, reintegrando el stock de los productos.
 */
async function remove(req, res, next) {
  try {
    const id = requireId(req.params.id, 'id');

    await sequelize.transaction(async (transaction) => {
      const sale = await findSaleOr404(id, { transaction });
      const details = await SaleDetail.findAll({ where: { saleId: id }, transaction });
      for (const detail of details) {
        await releaseStock(detail.productId, detail.quantity, transaction);
      }
      await SaleDetail.destroy({ where: { saleId: id }, transaction });
      await sale.destroy({ transaction });
    });

    res.json({ message: `Venta ${id} eliminada correctamente` });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
