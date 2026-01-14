const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const templateRoutes = require('./templateRoutes');
const offerRoutes = require('./offerRoutes');
const universalCompanyRoutes = require('./universalCompanyRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/templates', templateRoutes);
router.use('/offers', offerRoutes);
router.use('/universal', universalCompanyRoutes);

module.exports = router;
