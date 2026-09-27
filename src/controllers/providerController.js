const Provider = require('../models/Provider');


exports.getProviders = async (req, res) => {
  try {
    const providers = await Provider.findAll();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};


exports.createProvider = async (req, res) => {
  try {
    const newProvider = await Provider.create(req.body);
    res.status(201).json(newProvider);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.deleteProvider = async (req, res) => {
  try {
    const deleted = await Provider.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Proveedor no encontrado' });
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
};