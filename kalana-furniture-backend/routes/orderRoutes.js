const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const { authenticate } = require('../middleware/auth');

// Apply authentication to order creation
router.post('/', authenticate, orderController.createOrder);

// User route for getting their own orders
router.get('/user', authenticate, orderController.getUserOrders);

// Admin routes for viewing/managing orders
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
