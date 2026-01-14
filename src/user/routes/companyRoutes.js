const express = require('express');
const router = express.Router();
const companyController = require('../controller/companyController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware(['User', 'Admin', 'Superadmin']));

// Company profile management
router.post('/setup', companyController.setupCompany);
router.get('/profile/:id', companyController.getCompanyProfile);
router.get('/organisation/:organisationId', companyController.getCompanyByOrganisation);
router.put('/config/:id', companyController.updateCompanyConfig);
router.delete('/:id', companyController.deleteCompany);

// Company data retrieval
router.get('/benefits/:id', companyController.getCompanyBenefits);
router.get('/compliance/:id', companyController.getCompanyCompliance);
router.get('/user/companies', companyController.listUserCompanies);

// Get company by organisation (for current user)
router.get('/my-company/:organisationId', companyController.getCompanyByOrganisation);

module.exports = router;

