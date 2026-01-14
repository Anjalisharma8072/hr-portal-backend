const express = require('express');
const router = express.Router();
const universalCompanyController = require('../controller/universalCompanyController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware(['User', 'Admin', 'Superadmin']));

// Company setup and management
router.post('/setup', universalCompanyController.setupCompany);
router.get('/profile/:id', universalCompanyController.getCompanyProfile);
router.put('/config/:id', universalCompanyController.updateCompanyConfig);
router.get('/summary/:id', universalCompanyController.getCompanySummary);

// Industry and template management
router.get('/templates/industry/:industry', universalCompanyController.getIndustryTemplates);

// Universal offer generation
router.post('/offers/generate', universalCompanyController.generateUniversalOffer);
router.post('/offers/bulk-generate', universalCompanyController.bulkGenerateUniversalOffers);

// Analytics and compliance
router.get('/analytics/:id', universalCompanyController.getCompanyAnalytics);
router.get('/compliance/:id', universalCompanyController.getCompanyCompliance);

module.exports = router;
