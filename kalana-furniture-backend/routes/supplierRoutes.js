const express = require('express');
const router = express.Router();
const supplierController = require('../controller/supplierController');
const { authenticateSupplier } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Supplier authentication routes
router.post('/register', supplierController.register);
router.post('/login', supplierController.login);
router.post('/logout', supplierController.logout);
router.delete('/account', authenticateSupplier, supplierController.deleteAccount);
router.get('/verify', supplierController.verifyToken);

// Profile management routes
router.put('/profile', authenticateSupplier, supplierController.updateProfile);
router.put('/password', authenticateSupplier, supplierController.changePassword);
router.post('/profile-image', authenticateSupplier, upload.single('image'), supplierController.uploadProfileImage);

// Admin routes for supplier management
router.get('/pending', supplierController.getPendingApplications);
router.get('/approved', supplierController.getApprovedSuppliers);
router.put('/:id/approve', supplierController.approveSupplier);
router.put('/:id/reject', supplierController.rejectSupplier);

module.exports = router;