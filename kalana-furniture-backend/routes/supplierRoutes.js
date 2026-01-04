const express = require('express');
const router = express.Router();
const supplierController = require('../controller/supplierController');

// Supplier authentication routes
router.post('/register', supplierController.register);
router.post('/login', supplierController.login);
router.post('/logout', supplierController.logout);
router.get('/verify', supplierController.verifyToken);

// Admin routes for supplier management
router.get('/pending', supplierController.getPendingApplications);
router.get('/approved', supplierController.getApprovedSuppliers);
router.put('/:id/approve', supplierController.approveSupplier);
router.put('/:id/reject', supplierController.rejectSupplier);

module.exports = router;