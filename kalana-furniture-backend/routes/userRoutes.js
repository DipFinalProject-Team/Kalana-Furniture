const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Authentication routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/verify', userController.verifyToken);

// User profile routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserProfile);
router.post('/', userController.createUserProfile);

module.exports = router;
