/**
 * Error con código HTTP asociado, lanzado desde los controladores
 * y convertido a respuesta JSON por el middleware de errores.
 */
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

module.exports = HttpError;
