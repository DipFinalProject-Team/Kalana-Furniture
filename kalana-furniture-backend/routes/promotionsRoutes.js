const express = require('express');
const router = express.Router();
const promotionsController = require('../controller/promotionsController');

router.get('/', promotionsController.getAllPromotions);
router.get('/:id', promotionsController.getPromotionById);
router.post('/', promotionsController.createPromotion);
router.put('/:id', promotionsController.updatePromotion);
router.put('/:id/toggle', promotionsController.togglePromotionStatus);
router.delete('/:id', promotionsController.deletePromotion);

module.exports = router;