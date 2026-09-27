# taller-backend-supermercado

API REST para la gestión básica de un supermercado de la empresa **MarketSoft**, desarrollada con **Node.js, Express, Sequelize y PostgreSQL** siguiendo arquitectura **MVC** y documentada con **Swagger**.

El sistema administra usuarios, proveedores, productos y ventas. Cada venta puede incluir varios productos y **su total se calcula automáticamente** a partir de sus detalles. Esta API será consumida posteriormente por el frontend.

---

## Integrantes y responsabilidades

| Integrante | Rol | Responsabilidades |
|---|---|---|
| Harold David Garces Casas | Backend / DevOps | **Módulo transaccional + Swagger + Documentación:** modelos y CRUD de `Sales` y `SaleDetails`; relaciones Usuario → Ventas, Venta → DetalleVenta y Producto → DetalleVenta; cálculo automático del total de la venta (`quantity × price`), control de stock y transacciones; configuración de Swagger; flujo de ramas y Pull Requests en GitHub; redacción del README. |
| Darrel Godoy Quintero | Backend | **Módulo de catálogo:** modelos y endpoints de `Users`, `Providers` y `Products`; relación Proveedor → Productos; conexión a PostgreSQL; servidor Express (`server.js`) e integración de las rutas y de Swagger UI. |

---

## Tecnologías

- Node.js + Express
- PostgreSQL
- Sequelize ORM
- Swagger (`swagger-jsdoc` + `swagger-ui-express`)
- dotenv

---

## Estructura del proyecto (MVC)

```
├── server.js                      # Entrada: Express, conexión a la BD, sincronización y rutas
└── src
    ├── config
    │   ├── database.js            # Conexión Sequelize a PostgreSQL (variables de .env)
    │   └── swagger.js             # Especificación OpenAPI
    ├── models                     # MODEL: modelos Sequelize
    │   ├── index.js               # Relaciones entre modelos
    │   ├── User.js
    │   ├── Provider.js
    │   ├── Product.js
    │   ├── Sale.js
    │   └── SaleDetail.js
    ├── controllers                # CONTROLLER: lógica de negocio de cada endpoint
    │   ├── userController.js
    │   ├── providerController.js
    │   ├── productController.js
    │   ├── sale.controller.js
    │   ├── saleDetail.controller.js
    │   └── helpers/sale.helpers.js  # Cálculo del total, validaciones y stock
    ├── routes                     # Endpoints (+ documentación Swagger de ventas)
    └── utils/HttpError.js         # Errores con código HTTP
```

- **Model:** modelos Sequelize de cada entidad con sus relaciones.
- **Controller:** lógica de negocio y manejo de cada endpoint.
- **View:** respuestas JSON de la API, documentadas y probables desde Swagger UI.

Las rutas solo asocian cada URL con su controlador; la lógica de negocio está en los controladores.

---

## Instrucciones de ejecución

### Requisitos

- Node.js 18 o superior
- PostgreSQL en ejecución, con una base de datos creada (por ejemplo `supermercado`):

```sql
CREATE DATABASE supermercado;
```

### 1. Clonar e instalar

```bash
git clone https://github.com/kobyt0/taller-backend-supermercado.git
cd taller-backend-supermercado
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con los datos de tu PostgreSQL:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=supermercado
DB_USER=postgres
DB_PASSWORD=tu_contraseña
```

### 3. Ejecutar

```bash
npm start
```

Al iniciar, Sequelize crea automáticamente las tablas y relaciones. En consola debe aparecer:

```
✅ Conexión a PostgreSQL establecida correctamente.
✅ Tablas e índices sincronizados.
🚀 Servidor ejecutándose en http://localhost:3000
📄 Documentación Swagger disponible en http://localhost:3000/api-docs
```

Para desarrollo con recarga automática: `npm run dev`.

### Documentación Swagger

Con el servidor iniciado, abrir **<http://localhost:3000/api-docs>**. Desde ahí se pueden probar los endpoints con el botón **Try it out**.

---

## Modelo de datos

| Entidad | Tabla | Campos |
|---|---|---|
| Usuario | `Users` | id, nombre, email, password, rol (`ADMIN`, `EMPLEADO`, `CLIENTE`) |
| Proveedor | `Providers` | id, nombre, nit, telefono, email, direccion |
| Producto | `Products` | id, nombre, precio, stock, categoria, providerId |
| Venta | `sales` | id, userId, date, total |
| DetalleVenta | `sale_details` | id, saleId, productId, quantity, price |

### Relaciones

- Proveedor **1 → N** Productos (`Provider.hasMany(Product)`, `providerId`)
- Usuario **1 → N** Ventas (`User.hasMany(Sale)`, `userId`)
- Venta **1 → N** DetalleVenta (`Sale.hasMany(SaleDetail)`, `saleId`)
- Producto **1 → N** DetalleVenta (`Product.hasMany(SaleDetail)`, `productId`)

### Reglas de negocio y validaciones

- **Usuarios:** email único y con formato válido. La contraseña nunca se devuelve en las respuestas.
- **Ventas:**
  - El **total se calcula automáticamente** como `Σ (quantity × price)` de sus detalles. Si se envía `total` en el body, se ignora.
  - El total se recalcula cada vez que se crea, modifica o elimina un detalle, o cuando se reemplazan los detalles de la venta.
  - Si un detalle no trae `price`, se usa el precio actual del producto. El precio queda guardado en el detalle aunque después cambie el del producto.
  - Si el mismo producto aparece varias veces en `details`, las cantidades se suman en una sola línea.
  - Al vender se **descuenta el stock**; si no alcanza, la venta se rechaza. Al eliminar o modificar una venta o un detalle, el stock se devuelve.
  - Cada operación de venta se ejecuta en una **transacción**: si algo falla, no se guarda nada.
  - `quantity` debe ser un entero ≥ 1 y `price` un número > 0.

---

## Endpoints

Base URL: `http://localhost:3000`

### Usuarios — `/api/users`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users` | Lista los usuarios |
| GET | `/api/users/:id` | Obtiene un usuario |
| POST | `/api/users` | Crea un usuario |
| DELETE | `/api/users/:id` | Elimina un usuario |

### Proveedores — `/api/providers`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/providers` | Lista los proveedores |
| POST | `/api/providers` | Crea un proveedor |
| DELETE | `/api/providers/:id` | Elimina un proveedor |

### Productos — `/api/products`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/products` | Lista los productos con su proveedor |
| POST | `/api/products` | Crea un producto |
| DELETE | `/api/products/:id` | Elimina un producto |

### Ventas — `/api/sales`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/sales` | Lista las ventas con usuario y detalles (filtro opcional `?userId=`) |
| GET | `/api/sales/:id` | Obtiene una venta |
| POST | `/api/sales` | Crea una venta con sus detalles (total automático) |
| PUT | `/api/sales/:id` | Actualiza usuario/fecha y opcionalmente reemplaza los detalles |
| DELETE | `/api/sales/:id` | Elimina la venta y sus detalles (devuelve el stock) |

### Detalles de venta — `/api/sale-details`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/sale-details` | Lista detalles (filtros opcionales `?saleId=` y `?productId=`) |
| GET | `/api/sale-details/:id` | Obtiene un detalle |
| POST | `/api/sale-details` | Agrega un producto a una venta existente |
| PUT | `/api/sale-details/:id` | Modifica un detalle (ajusta stock y total) |
| DELETE | `/api/sale-details/:id` | Elimina un detalle (devuelve stock y recalcula el total) |

---

## Ejemplos de uso

Orden recomendado para probar: crear un proveedor, luego productos, luego un usuario y por último una venta.

### Crear un proveedor

```bash
curl -X POST http://localhost:3000/api/providers \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Distribuidora Andina",
    "nit": "900123456-1",
    "telefono": "3001234567",
    "email": "ventas@andina.com",
    "direccion": "Calle 10 # 5-20, Cali"
  }'
```

### Crear productos

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Arroz 1kg", "precio": 4500, "stock": 100, "categoria": "Granos", "providerId": 1 }'

curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Leche 1L", "precio": 3300, "stock": 80, "categoria": "Lácteos", "providerId": 1 }'
```

### Crear un usuario

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{ "nombre": "Ana Pérez", "email": "ana@marketsoft.com", "password": "123456", "rol": "EMPLEADO" }'
```

Respuesta `201 Created` (sin la contraseña):

```json
{ "id": 1, "nombre": "Ana Pérez", "email": "ana@marketsoft.com", "rol": "EMPLEADO", "createdAt": "...", "updatedAt": "..." }
```

### Crear una venta

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "details": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 3, "price": 3000 }
    ]
  }'
```

Respuesta `201 Created`. El total `18000 = 2 × 4500 + 3 × 3000` se calculó automáticamente y el stock de ambos productos se descontó:

```json
{
  "id": 1,
  "userId": 1,
  "date": "2026-09-26T20:16:00.000Z",
  "total": "18000.00",
  "user": { "id": 1, "nombre": "Ana Pérez", "email": "ana@marketsoft.com", "rol": "EMPLEADO" },
  "details": [
    {
      "id": 1, "saleId": 1, "productId": 1, "quantity": 2, "price": "4500.00", "subtotal": 9000,
      "product": { "id": 1, "nombre": "Arroz 1kg", "precio": "4500.00", "stock": 98 }
    },
    {
      "id": 2, "saleId": 1, "productId": 2, "quantity": 3, "price": "3000.00", "subtotal": 9000,
      "product": { "id": 2, "nombre": "Leche 1L", "precio": "3300.00", "stock": 77 }
    }
  ]
}
```

### Consultar ventas

```bash
curl http://localhost:3000/api/sales
curl http://localhost:3000/api/sales?userId=1
curl http://localhost:3000/api/sales/1
```

### Actualizar una venta (reemplazando sus detalles)

```bash
curl -X PUT http://localhost:3000/api/sales/1 \
  -H "Content-Type: application/json" \
  -d '{ "details": [ { "productId": 1, "quantity": 5 } ] }'
```

El total pasa a `22500.00`: se devuelve el stock de los detalles anteriores y se descuenta el de los nuevos.

### Agregar un producto a una venta existente

```bash
curl -X POST http://localhost:3000/api/sale-details \
  -H "Content-Type: application/json" \
  -d '{ "saleId": 1, "productId": 2, "quantity": 1 }'
```

La respuesta incluye el detalle creado y la venta con su total actualizado (`sale.total`).

### Modificar y eliminar un detalle

```bash
curl -X PUT http://localhost:3000/api/sale-details/3 \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 2 }'

curl -X DELETE http://localhost:3000/api/sale-details/3
```

```json
{ "message": "Detalle de venta 3 eliminado correctamente", "saleTotal": 22500 }
```

### Eliminar una venta

```bash
curl -X DELETE http://localhost:3000/api/sales/1
```

```json
{ "message": "Venta 1 eliminada correctamente" }
```

### Errores

Todas las respuestas de error son JSON. Ejemplo al vender más unidades de las disponibles:

```json
{ "status": "error", "message": "Stock insuficiente para \"Arroz 1kg\" (disponible: 95, solicitado: 999)" }
```

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos: id no numérico, `quantity` < 1, `price` ≤ 0, `details` vacío, stock insuficiente, email repetido |
| 404 | Venta, detalle, usuario o producto inexistente |
| 500 | Error interno del servidor |
