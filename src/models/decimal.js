/**
 * PostgreSQL devuelve los DECIMAL como string; este getter
 * los convierte a número para que la API responda valores numéricos.
 */
const decimalGetter = (field) =>
  function get() {
    const value = this.getDataValue(field);
    return value === null || value === undefined ? value : Number(value);
  };

module.exports = { decimalGetter };
