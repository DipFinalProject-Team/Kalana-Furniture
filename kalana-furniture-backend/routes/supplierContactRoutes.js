const express = require('express');
const router = express.Router();
const supplierContactController = require('../controller/supplierContactController');

router.post('/', supplierContactController.submitSupplierContactForm);

module.exports = router;
