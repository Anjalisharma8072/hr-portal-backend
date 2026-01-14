const express = require('express');
const router = express.Router();
const templateController = require('../controller/templateController');
const authMiddleware = require('../../../middleware/authMiddleware');
const fileUploadService = require('../services/fileUploadService');

// Apply authentication middleware to all routes
router.use(authMiddleware(['User', 'Admin']));

// Template CRUD operations
router.post('/create', templateController.createTemplate);
router.post('/upload-and-parse', 
  fileUploadService.getUploadInstance('templateFile'),
  templateController.uploadAndParseTemplate
);
router.get('/list', templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

// Template operations
router.post('/:id/duplicate', templateController.duplicateTemplate);
router.get('/:id/placeholders', templateController.getTemplatePlaceholders);
router.post('/:id/preview', templateController.previewTemplate);

// Template analytics
router.get('/stats/overview', templateController.getTemplateStats);

module.exports = router;
