const express = require('express');
const router = express.Router();
const authController = require('../../admin/controller/authController');

router.post('/login', authController.loginAdmin);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;