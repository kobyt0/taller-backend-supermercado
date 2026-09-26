const { Sale, SaleDetail, Product } = require('../../models');
const HttpError = require('../../utils/HttpError');

const round2 = (value) => Math.round(value * 100) / 100;

/** Devuelve el id como entero positivo, o null si no es válido. */
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function requireId(value, field) {
  const id = parseId(value);
  if (!id) throw new HttpError(400, `${field} debe ser un entero positivo`);
  return id;
}

function requireQuantity(value, field = 'quantity') {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new HttpError(400, `${field} debe ser un entero mayor o igual a 1`);
  }
  return quantity;
}

/** Precio opcional: si no se envía, se usa el precio actual del producto. */
function optionalPrice(value, field = 'price') {
  if (value === undefined || value === null) return undefined;
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) {
    throw new HttpError(400, `${field} debe ser un número mayor a 0`);
  }
  return round2(price);
}

/** Valida y normaliza el arreglo de detalles recibido al crear/actualizar una venta. */
function parseDetailsInput(details) {
  if (!Array.isArray(details) || details.length === 0) {
    throw new HttpError(400, 'details debe ser un arreglo con al menos un producto');
  }
  return details.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new HttpError(400, `details[${index}] debe ser un objeto`);
    }
    return {
      productId: requireId(item.productId, `details[${index}].productId`),
      quantity: requireQuantity(item.quantity, `details[${index}].quantity`),
      price: optionalPrice(item.price, `details[${index}].price`),
    };
  });
}

/** Lógica de negocio: total = Σ (quantity * price) de los detalles. */
function calculateTotal(details) {
  return round2(details.reduce((sum, d) => sum + Number(d.quantity) * Number(d.price), 0));
}

/** Recalcula y persiste el total de una venta a partir de sus detalles actuales. */
async function recalculateSaleTotal(saleId, transaction) {
  const details = await SaleDetail.findAll({ where: { saleId }, transaction });
  const total = calculateTotal(details);
  await Sale.update({ total }, { where: { id: saleId }, transaction });
  return total;
}

/** Descuenta stock del producto verificando disponibilidad. Devuelve el producto. */
async function reserveStock(productId, quantity, transaction) {
  const product = await Product.findByPk(productId, { transaction, lock: transaction.LOCK.UPDATE });
  if (!product) throw new HttpError(404, `El producto con id ${productId} no existe`);
  if (product.stock < quantity) {
    throw new HttpError(
      400,
      `Stock insuficiente para "${product.name}" (disponible: ${product.stock}, solicitado: ${quantity})`
    );
  }
  await product.decrement('stock', { by: quantity, transaction });
  return product;
}

/** Devuelve al inventario el stock de un detalle que se elimina o modifica. */
async function releaseStock(productId, quantity, transaction) {
  await Product.increment('stock', { by: quantity, where: { id: productId }, transaction });
}

/**
 * Reserva stock para cada línea y arma los detalles listos para insertar,
 * usando el precio del producto cuando no se especifica uno.
 */
async function buildSaleLines(items, transaction) {
  const lines = [];
  for (const item of items) {
    const product = await reserveStock(item.productId, item.quantity, transaction);
    lines.push({
      productId: product.id,
      quantity: item.quantity,
      price: item.price ?? product.price,
    });
  }
  return lines;
}

module.exports = {
  parseId,
  requireId,
  requireQuantity,
  optionalPrice,
  parseDetailsInput,
  calculateTotal,
  recalculateSaleTotal,
  reserveStock,
  releaseStock,
  buildSaleLines,
};
