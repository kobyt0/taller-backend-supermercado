const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'MarketSoft - API Supermercado',
      version: '1.0.0',
      description:
        'API REST para la gestión de un supermercado: productos, proveedores, usuarios, ventas y detalles de venta.',
    },
    servers: [{ url: '/', description: 'Servidor actual' }],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'La venta con id 99 no existe' },
            details: {},
          },
        },
        Message: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Venta 1 eliminada correctamente' },
          },
        },
        UserSummary: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Ana Pérez' },
            email: { type: 'string', example: 'ana@marketsoft.com' },
            role: { type: 'string', example: 'cajero' },
          },
        },
        ProductSummary: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Arroz 1kg' },
            price: { type: 'number', example: 4500 },
          },
        },
        SaleDetail: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            saleId: { type: 'integer', example: 1 },
            productId: { type: 'integer', example: 1 },
            quantity: { type: 'integer', example: 2 },
            price: { type: 'number', description: 'Precio unitario al momento de la venta', example: 4500 },
            subtotal: { type: 'number', description: 'quantity * price', example: 9000 },
            product: { $ref: '#/components/schemas/ProductSummary' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SaleDetailWithSale: {
          allOf: [
            { $ref: '#/components/schemas/SaleDetail' },
            {
              type: 'object',
              properties: {
                sale: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', example: 1 },
                    userId: { type: 'integer', example: 1 },
                    date: { type: 'string', format: 'date-time' },
                    total: { type: 'number', example: 12300 },
                  },
                },
              },
            },
          ],
        },
        SaleDetailLineInput: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'integer', example: 1 },
            quantity: { type: 'integer', minimum: 1, example: 2 },
            price: {
              type: 'number',
              description: 'Opcional. Si no se envía se usa el precio actual del producto.',
              example: 4500,
            },
          },
        },
        SaleDetailInput: {
          type: 'object',
          required: ['saleId', 'productId', 'quantity'],
          properties: {
            saleId: { type: 'integer', example: 1 },
            productId: { type: 'integer', example: 3 },
            quantity: { type: 'integer', minimum: 1, example: 1 },
            price: {
              type: 'number',
              description: 'Opcional. Si no se envía se usa el precio actual del producto.',
              example: 3200,
            },
          },
        },
        SaleDetailUpdate: {
          type: 'object',
          properties: {
            saleId: { type: 'integer', example: 1 },
            productId: { type: 'integer', example: 3 },
            quantity: { type: 'integer', minimum: 1, example: 4 },
            price: { type: 'number', example: 3200 },
          },
        },
        Sale: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            date: { type: 'string', format: 'date-time' },
            total: {
              type: 'number',
              readOnly: true,
              description: 'Calculado automáticamente: suma de quantity * price de los detalles',
              example: 12300,
            },
            user: { $ref: '#/components/schemas/UserSummary' },
            details: { type: 'array', items: { $ref: '#/components/schemas/SaleDetail' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SaleInput: {
          type: 'object',
          required: ['userId', 'details'],
          properties: {
            userId: { type: 'integer', example: 1 },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Opcional. Por defecto la fecha actual.',
            },
            details: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/SaleDetailLineInput' },
              example: [
                { productId: 1, quantity: 2 },
                { productId: 2, quantity: 1, price: 3300 },
              ],
            },
          },
        },
        SaleUpdate: {
          type: 'object',
          properties: {
            userId: { type: 'integer', example: 2 },
            date: { type: 'string', format: 'date-time' },
            details: {
              type: 'array',
              description: 'Opcional. Si se envía, reemplaza todos los detalles de la venta.',
              minItems: 1,
              items: { $ref: '#/components/schemas/SaleDetailLineInput' },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Datos inválidos',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
      parameters: {
        IdParam: {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer', minimum: 1 },
        },
      },
    },
  },
  // Las rutas se documentan con comentarios JSDoc @openapi en cada archivo de rutas.
  // Se normaliza a "/" porque el patrón glob no funciona con "\" en Windows.
  apis: [path.join(__dirname, '../routes/*.js').replace(/\\/g, '/')],
};

module.exports = swaggerJsdoc(options);