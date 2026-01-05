const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const auth = require('../middleware/auth').authenticate;
const upload = require('../middleware/upload');

// Authentication routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.get('/verify', userController.verifyToken);

// User profile routes (protected)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserProfile);
router.post('/', userController.createUserProfile);
router.put('/profile', auth, userController.updateUserProfile);
router.put('/change-password', auth, userController.changePassword);
router.post('/upload-profile-picture', auth, upload.single('profilePicture'), userController.uploadProfilePicture);

module.exports = router;
