const express = require('express');
const adminController = require('../controller/adminController');
const orderController = require('../controller/orderController');

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
router.get('/suppliers', adminController.getAllSuppliers);
router.get('/suppliers/pending', adminController.getPendingApplications);
router.get('/suppliers/approved', adminController.getApprovedSuppliers);
router.put('/suppliers/:id/approve', adminController.approveSupplier);
router.put('/suppliers/:id/reject', adminController.rejectSupplier);
router.put('/suppliers/:id/status', adminController.updateSupplierStatus);
router.delete('/suppliers/:id', adminController.deleteSupplier);

// Supplier contact management routes
router.get('/supplier-contacts', adminController.getAllSupplierContacts);
router.put('/supplier-contacts/:id', adminController.updateSupplierContact);

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

// Review management routes
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);

// Order management routes
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Dashboard stats route
router.get('/dashboard/stats', adminController.getDashboardStats);

// Analytics routes
router.get('/analytics/monthly-sales', adminController.getMonthlySales);
router.get('/analytics/orders-trend', adminController.getOrdersTrend);
router.get('/analytics/sales-by-category', adminController.getSalesByCategory);
router.get('/analytics/top-selling-products', adminController.getTopSellingProducts);

module.exports = router;