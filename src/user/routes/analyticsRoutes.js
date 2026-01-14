const express = require('express');
const router = express.Router();
const analyticsController = require('../controller/analyticsController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware(['User', 'Admin', 'Superadmin']));

/**
 * @route   GET /api/user/analytics/dashboard
 * @desc    Get comprehensive organisation dashboard analytics
 * @access  Private
 */
router.get('/dashboard', analyticsController.getOrganisationDashboard);

/**
 * @route   GET /api/user/analytics/users/stats
 * @desc    Get user statistics for dashboard
 * @access  Private
 */
router.get('/users/stats', analyticsController.getUserStatistics);

/**
 * @route   GET /api/user/analytics/templates/stats
 * @desc    Get template statistics for dashboard
 * @access  Private
 */
router.get('/templates/stats', analyticsController.getTemplateStatistics);

/**
 * @route   GET /api/user/analytics/offers/stats
 * @desc    Get offer statistics for dashboard
 * @access  Private
 */
router.get('/offers/stats', analyticsController.getOfferStatistics);

/**
 * @route   GET /api/user/analytics/companies/stats
 * @desc    Get company statistics for dashboard
 * @access  Private
 */
router.get('/companies/stats', analyticsController.getCompanyStatistics);

/**
 * @route   GET /api/user/analytics/recent-activity
 * @desc    Get recent activity for dashboard
 * @access  Private
 */
router.get('/recent-activity', analyticsController.getRecentActivity);

/**
 * @route   GET /api/user/analytics/export-options
 * @desc    Get available export options for reports
 * @access  Private
 */
router.get('/export-options', analyticsController.getExportOptions);

/**
 * @route   POST /api/user/analytics/generate-report
 * @desc    Generate and download analytics report
 * @access  Private
 */
router.post('/generate-report', analyticsController.generateReport);

/**
 * @route   GET /api/user/analytics/:companyId/dashboard
 * @desc    Get company-specific dashboard analytics
 * @access  Private
 */
router.get('/:companyId/dashboard', analyticsController.getCompanyAnalytics);

/**
 * @route   GET /api/user/analytics/:companyId
 * @desc    Get company analytics
 * @access  Private
 */
router.get('/:companyId', analyticsController.getCompanyAnalytics);

/**
 * @route   GET /api/user/analytics/:companyId/insights
 * @desc    Get analytics insights and recommendations
 * @access  Private
 */
router.get('/:companyId/insights', analyticsController.getAnalyticsInsights);

/**
 * @route   GET /api/user/analytics/:companyId/comparison
 * @desc    Get analytics comparison data
 * @access  Private
 */
router.get('/:companyId/comparison', analyticsController.getAnalyticsComparison);

/**
 * @route   GET /api/user/analytics/:companyId/executive-report
 * @desc    Generate executive report
 * @access  Private
 */
router.get('/:companyId/executive-report', analyticsController.generateExecutiveReport);

/**
 * @route   GET /api/user/analytics/:companyId/pdf-report
 * @desc    Generate PDF report
 * @access  Private
 */
router.get('/:companyId/pdf-report', analyticsController.generatePDFReport);

/**
 * @route   GET /api/user/analytics/:companyId/excel-report
 * @desc    Generate Excel report
 * @access  Private
 */
router.get('/:companyId/excel-report', analyticsController.generateExcelReport);

/**
 * @route   GET /api/user/analytics/:companyId/download/:filename
 * @desc    Download generated report
 * @access  Private
 */
router.get('/:companyId/download/:filename', analyticsController.downloadReport);

/**
 * @route   GET /api/user/analytics/cleanup/reports
 * @desc    Clean up old reports
 * @access  Private
 */
router.get('/cleanup/reports', analyticsController.cleanupOldReports);

/**
 * @route   GET /api/user/analytics/export/options
 * @desc    Get export options
 * @access  Private
 */
router.get('/export/options', analyticsController.getExportOptions);

module.exports = router;
