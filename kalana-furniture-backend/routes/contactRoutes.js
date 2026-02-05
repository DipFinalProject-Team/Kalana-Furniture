const express = require('express');
const router = express.Router();
const contactController = require('../controller/contactController');

router.post('/', contactController.submitContactForm);
router.get('/', contactController.getAllContactForms);
router.put('/:id/status', contactController.updateContactFormStatus);

module.exports = router;
