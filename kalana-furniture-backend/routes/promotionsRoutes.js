const express = require('express');
const router = express.Router();
const promotionsController = require('../controller/promotionsController');
const { authenticate } = require('../middleware/auth');

router.get('/', promotionsController.getAllPromotions);
router.get('/active', promotionsController.getActivePromotions);
router.get('/:id', promotionsController.getPromotionById);
router.post('/', promotionsController.createPromotion);
router.put('/:id', promotionsController.updatePromotion);
router.put('/:id/toggle', promotionsController.togglePromotionStatus);
router.delete('/:id', promotionsController.deletePromotion);
router.post('/apply', authenticate, promotionsController.applyPromoCode);

module.exports = router;