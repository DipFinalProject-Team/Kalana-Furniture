const express = require('express');
const router = express.Router();
const supplierController = require('../controller/supplierController');
const { authenticateSupplier } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Supplier authentication routes
router.post('/register', supplierController.register);
router.post('/login', supplierController.login);
router.post('/forgot-password', supplierController.forgotPassword);
router.post('/reset-password', supplierController.resetPassword);
router.post('/logout', supplierController.logout);
router.delete('/account', authenticateSupplier, supplierController.deleteAccount);
router.get('/verify', supplierController.verifyToken);

// Profile management routes
router.put('/profile', authenticateSupplier, supplierController.updateProfile);
router.put('/password', authenticateSupplier, supplierController.changePassword);
router.post('/profile-image', authenticateSupplier, upload.single('image'), supplierController.uploadProfileImage);

// Dashboard routes
router.get('/dashboard/stats', authenticateSupplier, supplierController.getDashboardStats);
router.get('/dashboard/orders', authenticateSupplier, supplierController.getRecentSupplyOrders);
router.get('/dashboard/low-stock', authenticateSupplier, supplierController.getLowStockRequests);
router.get('/dashboard/trends', authenticateSupplier, supplierController.getOrderTrends);

// Order routes
router.get('/orders', authenticateSupplier, supplierController.getPurchaseOrders);
router.put('/orders/:id/status', authenticateSupplier, supplierController.updatePurchaseOrderStatus);
router.put('/orders/:id/details', authenticateSupplier, supplierController.updatePurchaseOrderDetails);

// Invoice routes
router.get('/invoices', authenticateSupplier, supplierController.getInvoices);
router.get('/invoices/:id', authenticateSupplier, supplierController.getInvoiceDetails);

// Notification routes
router.get('/notifications', authenticateSupplier, supplierController.getNotifications);

module.exports = router;