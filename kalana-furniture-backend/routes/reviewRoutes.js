const express = require('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');
const auth = require('../middleware/auth').authenticate;
const upload = require('../middleware/upload');

// Get all reviews for a product
router.get('/product/:productId', reviewController.getProductReviews);

// Create a new review (requires authentication)
router.post('/product/:productId', auth, upload.array('images', 5), reviewController.createReview);

// Update a review (requires authentication)
router.put('/:reviewId', auth, reviewController.updateReview);

// Delete a review (requires authentication)
router.delete('/:reviewId', auth, reviewController.deleteReview);

module.exports = router;