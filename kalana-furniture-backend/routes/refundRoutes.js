const express = require('express');
const router = express.Router();
const refundController = require('../controller/refundController');

router.post('/', refundController.createRefundRequest);

module.exports = router;
