const express = require('express');
const router = express.Router();
const offerController = require('../controller/offerController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware(['User', 'Admin']));

// Offer generation and management
router.post('/generate', offerController.generateOffer);
router.post('/generate-company', offerController.generateCompanyOffer);
router.post('/bulk-generate', offerController.bulkGenerateOffers);
router.get('/list', offerController.getOffers);
router.get('/:id', offerController.getOfferById);

// Offer operations
router.put('/:id/status', offerController.updateOfferStatus);
router.post('/:id/send', offerController.sendOffer);
router.post('/:id/reminder', offerController.sendOfferReminder);
router.post('/:id/view', offerController.markOfferAsViewed);
router.post('/:id/generate-pdf', offerController.generateOfferPDF);
router.get('/:id/download', offerController.downloadOfferPDF);

// Advanced search and filtering
router.post('/search', offerController.advancedSearch);
router.get('/search/suggestions', offerController.getSearchSuggestions);
router.get('/search/filter-options', offerController.getFilterOptions);

// Offer analytics
router.get('/analytics/overview', offerController.getOfferAnalytics);

module.exports = router;
