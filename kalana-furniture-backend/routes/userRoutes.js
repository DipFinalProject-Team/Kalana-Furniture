const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserProfile);
router.post('/', userController.createUserProfile);

module.exports = router;
