const express = require('express');
const router = express.Router();
const refundController = require('../controller/refundController');

router.post('/', refundController.createRefundRequest);
router.get('/', refundController.getAllRefundRequests);
router.put('/:id/status', refundController.updateRefundRequestStatus);

module.exports = router;
