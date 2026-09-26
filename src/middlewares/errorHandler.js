const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  DatabaseError,
} = require('sequelize');
const HttpError = require('../utils/HttpError');

/** Responde 404 en JSON para cualquier ruta no definida. */
function notFound(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

/** Convierte cualquier error en una respuesta JSON con el código HTTP adecuado. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: 'Registro duplicado',
      details: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      error: 'La operación viola una relación entre entidades (registro relacionado inexistente o en uso)',
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(400).json({ error: 'Datos inválidos para la base de datos', details: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { notFound, errorHandler };
