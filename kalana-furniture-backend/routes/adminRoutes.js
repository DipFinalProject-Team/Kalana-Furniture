const express = require('express');
const adminController = require('../controller/adminController');

const router = express.Router();

// Admin login
router.post('/login', adminController.login);

// Admin logout
router.post('/logout', adminController.logout);

// Verify admin token
router.get('/verify', adminController.verifyToken);

// Change admin password
router.post('/change-password', adminController.changePassword);

// Supplier management routes
router.get('/suppliers/pending', adminController.getPendingApplications);
router.get('/suppliers/approved', adminController.getApprovedSuppliers);
router.put('/suppliers/:id/approve', adminController.approveSupplier);
router.put('/suppliers/:id/reject', adminController.rejectSupplier);

// Inventory management routes
router.get('/inventory', adminController.getInventory);
router.put('/inventory/:id/stock', adminController.updateStock);

// Purchase order management routes
router.get('/purchase-orders', adminController.getPurchaseOrders);
router.post('/purchase-orders', adminController.createPurchaseOrder);
router.put('/purchase-orders/:id/status', adminController.updatePurchaseOrderStatus);

// Invoice management routes
router.get('/invoices', adminController.getInvoices);
router.put('/invoices/:id/pay', adminController.markInvoiceAsPaid);

// Customer management routes
router.get('/customers', adminController.getAllCustomers);
router.put('/customers/:id/status', adminController.updateCustomerStatus);
router.get('/customers/:id', adminController.getCustomerDetails);

module.exports = router;