const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');

router.get('/', providerController.getProviders);
router.post('/', providerController.createProvider);
router.delete('/:id', providerController.deleteProvider);

module.exports = router;