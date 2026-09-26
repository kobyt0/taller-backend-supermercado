# taller-backend-supermercado

API REST para la gestión de un supermercado (**MarketSoft**) desarrollada con **Node.js, Express, Sequelize y PostgreSQL**, siguiendo arquitectura **MVC** y documentada con **Swagger**.

Permite administrar productos, proveedores, usuarios y ventas (con sus detalles). El total de cada venta se calcula automáticamente a partir de sus productos.

---

## Integrantes y responsabilidades

| Integrante | Rol | Responsabilidades |
|---|---|---|
| Harold David Garces Casas | Backend / DevOps | **Módulo transaccional + Swagger + Documentación:** estructura base del proyecto (Express, conexión a PostgreSQL con Sequelize, `server.js`), modelos y CRUD de `Sales` y `SaleDetails`, relaciones Usuario → Ventas, Venta → DetalleVenta y Producto → DetalleVenta, cálculo automático del total de la venta, manejo de stock y transacciones, configuración de Swagger y redacción del README. |
| _Nombre completo_ | _Por completar_ | _Por completar_ |

---

## Tecnologías

- Node.js (>= 18) + Express
- PostgreSQL
- Sequelize ORM
- Swagger (`swagger-jsdoc` + `swagger-ui-express`)

---

## Estructura del proyecto (MVC)

```
├── server.js                 # Entrada: conecta la BD, sincroniza modelos e inicia Express
├── src
│   ├── app.js                # Configuración de Express, Swagger y rutas
│   ├── config
│   │   ├── database.js       # Conexión Sequelize (y creación automática de la BD)
│   │   └── swagger.js        # Especificación OpenAPI y esquemas
│   ├── models                # MODEL: modelos Sequelize y relaciones (index.js)
│   ├── controllers           # CONTROLLER: lógica de negocio de cada endpoint
│   │   └── helpers           # Cálculo del total, validaciones y manejo de stock
│   ├── routes                # Definición de endpoints + documentación Swagger
│   ├── middlewares           # Manejo de errores y 404 en JSON
│   ├── utils                 # HttpError
│   └── seeders               # Datos de ejemplo (npm run seed)
└── .env.example
```

- **Model:** modelos Sequelize de cada entidad con sus validaciones y relaciones.
- **Controller:** lógica de negocio (validaciones, transacciones, cálculo de totales, stock).
- **View:** respuestas JSON de la API, documentadas y probables desde Swagger UI.

Las rutas solo enlazan URL → controlador; no contienen lógica de negocio.

---

## Instrucciones de ejecución

### Requisitos

- Node.js 18 o superior
- PostgreSQL en ejecución

### Pasos

```bash
git clone https://github.com/kobyt0/taller-backend-supermercado.git
cd taller-backend-supermercado
npm install
npm start
```

Por defecto la API se conecta a PostgreSQL en `localhost:5432` con usuario `postgres` y contraseña `postgres`, y usa la base de datos `supermercado`. **Si la base de datos no existe, se crea automáticamente** y las tablas se generan al iniciar.

Si tus credenciales son distintas, copia `.env.example` como `.env` y ajusta los valores:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=supermercado
DB_USER=postgres
DB_PASSWORD=postgres
```

### Datos de ejemplo (opcional)

Para probar las ventas de inmediato, carga proveedores, usuarios y productos de ejemplo (solo inserta si las tablas están vacías):

```bash
npm run seed
```

### Documentación Swagger

Con el servidor iniciado:

- Swagger UI: <http://localhost:3000/api-docs>
- Especificación OpenAPI (JSON): <http://localhost:3000/api-docs.json>

Desde Swagger UI se pueden probar todos los endpoints con el botón **Try it out**.

---

## Modelo de datos

| Entidad | Campos |
|---|---|
| Products | id, name, description, price, stock, providerId |
| Users | id, name, email, role |
| Providers | id, name, phone, email, city |
| Sales | id, userId, date, total |
| SaleDetails | id, saleId, productId, quantity, price |

### Relaciones

- Proveedor **1 → N** Productos (`Provider.hasMany(Product)`)
- Usuario **1 → N** Ventas (`User.hasMany(Sale)`)
- Venta **1 → N** DetalleVenta (`Sale.hasMany(SaleDetail)`, eliminación en cascada)
- Producto **1 → N** DetalleVenta (`Product.hasMany(SaleDetail)`)

### Validaciones y reglas de negocio

- **Productos:** precio mayor a 0 y stock no negativo.
- **Usuarios:** email único y con formato válido.
- **Ventas:**
  - El **total se calcula automáticamente** como `Σ (quantity × price)` de sus detalles; si se envía `total` en el body, se ignora.
  - Se recalcula cada vez que se crea, modifica o elimina un detalle, o cuando se reemplazan los detalles de la venta.
  - Si en un detalle no se envía `price`, se usa el precio actual del producto (el precio queda guardado en el detalle aunque luego cambie el del producto).
  - Al vender se **descuenta el stock**; si no hay stock suficiente la operación se rechaza. Al eliminar o modificar un detalle/venta, el stock se reintegra.
  - Todas las operaciones de venta se ejecutan en una **transacción**: si algo falla, no se guarda nada.

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/sales` | Lista las ventas (filtro opcional `?userId=`) |
| GET | `/api/sales/:id` | Obtiene una venta con su usuario y detalles |
| POST | `/api/sales` | Crea una venta con sus detalles |
| PUT | `/api/sales/:id` | Actualiza usuario/fecha y opcionalmente reemplaza los detalles |
| DELETE | `/api/sales/:id` | Elimina la venta y sus detalles |
| GET | `/api/sale-details` | Lista detalles (filtros opcionales `?saleId=` y `?productId=`) |
| GET | `/api/sale-details/:id` | Obtiene un detalle |
| POST | `/api/sale-details` | Agrega un producto a una venta existente |
| PUT | `/api/sale-details/:id` | Modifica un detalle |
| DELETE | `/api/sale-details/:id` | Elimina un detalle |

Los endpoints de `/api/products`, `/api/providers` y `/api/users` siguen el mismo formato (`GET`, `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`).

---

## Ejemplos de uso

> Los ejemplos asumen que se ejecutó `npm run seed`.

### Crear una venta

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "details": [
      { "productId": 1, "quantity": 2 },
      { "productId": 3, "quantity": 3, "price": 3000 }
    ]
  }'
```

Respuesta `201 Created` (el total `18000 = 2 × 4500 + 3 × 3000` se calculó automáticamente):

```json
{
  "id": 1,
  "userId": 1,
  "date": "2026-09-26T20:16:00.000Z",
  "total": 18000,
  "user": { "id": 1, "name": "Ana Pérez", "email": "ana@marketsoft.com", "role": "cajero" },
  "details": [
    {
      "id": 1, "saleId": 1, "productId": 1, "quantity": 2, "price": 4500, "subtotal": 9000,
      "product": { "id": 1, "name": "Arroz 1kg", "price": 4500 }
    },
    {
      "id": 2, "saleId": 1, "productId": 3, "quantity": 3, "price": 3000, "subtotal": 9000,
      "product": { "id": 3, "name": "Leche 1L", "price": 3300 }
    }
  ]
}
```

### Listar ventas / obtener una venta

```bash
curl http://localhost:3000/api/sales
curl http://localhost:3000/api/sales?userId=1
curl http://localhost:3000/api/sales/1
```

### Actualizar una venta (reemplazando sus detalles)

```bash
curl -X PUT http://localhost:3000/api/sales/1 \
  -H "Content-Type: application/json" \
  -d '{ "userId": 2, "details": [ { "productId": 1, "quantity": 5 } ] }'
```

El total pasa a `22500` y el stock se ajusta (se devuelve el de los detalles anteriores y se descuenta el de los nuevos).

### Eliminar una venta

```bash
curl -X DELETE http://localhost:3000/api/sales/1
```

```json
{ "message": "Venta 1 eliminada correctamente" }
```

### Agregar un producto a una venta existente

```bash
curl -X POST http://localhost:3000/api/sale-details \
  -H "Content-Type: application/json" \
  -d '{ "saleId": 1, "productId": 4, "quantity": 1 }'
```

Respuesta `201 Created` con el detalle y el total actualizado de la venta:

```json
{
  "id": 3, "saleId": 1, "productId": 4, "quantity": 1, "price": 9800, "subtotal": 9800,
  "product": { "id": 4, "name": "Queso 500g", "price": 9800 },
  "sale": { "id": 1, "userId": 1, "date": "2026-09-26T20:16:00.000Z", "total": 27800 }
}
```

### Modificar / eliminar un detalle

```bash
curl -X PUT http://localhost:3000/api/sale-details/3 \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 3 }'

curl -X DELETE http://localhost:3000/api/sale-details/3
```

```json
{ "message": "Detalle de venta 3 eliminado correctamente", "saleTotal": 18000 }
```

### Errores

Todas las respuestas de error son JSON:

```json
{ "error": "Stock insuficiente para \"Queso 500g\" (disponible: 30, solicitado: 999)" }
```

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos (id no numérico, cantidad < 1, precio ≤ 0, stock insuficiente, JSON mal formado) |
| 404 | Venta, detalle, usuario o producto inexistente, o ruta no definida |
| 409 | Email duplicado o registro en uso por otra entidad |
| 500 | Error interno |
