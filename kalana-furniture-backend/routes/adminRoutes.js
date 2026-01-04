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

module.exports = router;