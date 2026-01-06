const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const { authenticate } = require('../middleware/auth');

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/', cartController.addToCart);

// Update cart item quantity
router.put('/:id', cartController.updateCartItem);

// Remove item from cart
router.delete('/:id', cartController.removeFromCart);

// Clear entire cart
router.delete('/', cartController.clearCart);

module.exports = router;