const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Public routes
router.post('/register', authController.registerSuperadmin);
router.post('/verify-otp', authController.verifyRegistrationOTP);
router.post('/login', authController.loginSuperadmin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-otp', authController.resendOTP);

// Protected routes
router.get('/profile', authMiddleware(['Superadmin']), authController.getProfile);

module.exports = router;
