const express = require('express');
const router = express.Router();
const userAuthController = require('../../user/controller/authController');

router.post('/login', userAuthController.loginUser);
router.post('/forgot-password', userAuthController.forgotPassword);



module.exports = router;