const AnalyticsService = require('../services/analyticsService');
const analyticsService = new AnalyticsService(); // Create instance for instance methods
const reportingService = require('../services/reportingService');
const Company = require('../model/company');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const path = require('path'); // Added missing import for path

class AnalyticsController {
  /**
   * Get company analytics
   */
  async getCompanyAnalytics(req, res) {
    console.log('🔍 [AnalyticsController] getCompanyAnalytics called with:', {
      params: req.params,
      query: req.query,
      userId: req.user?.id
    });

    try {
      const { companyId } = req.params;
      const { dateRange = '30d' } = req.query;

      console.log('🔍 [AnalyticsController] Processing request:', { companyId, dateRange });

      // Validate companyId
      if (!companyId) {
        console.error('🔍 [AnalyticsController] Company ID missing');
        return errorResponse(res, 'Company ID is required', 400);
      }

      // Check if company exists and user has access
      const company = await Company.findById(companyId);
      console.log('🔍 [AnalyticsController] Company lookup result:', { 
        found: !!company, 
        companyId: company?._id,
        companyUserId: company?.userId 
      });

      if (!company) {
        console.error('🔍 [AnalyticsController] Company not found:', companyId);
        return errorResponse(res, 'Company not found', 404);
      }

      // Verify user has access to this company
      if (company.userId.toString() !== req.user.id) {
        console.error('🔍 [AnalyticsController] Access denied:', {
          companyUserId: company.userId.toString(),
          requestUserId: req.user.id
        });
        return errorResponse(res, 'Access denied', 403);
      }

      console.log('🔍 [AnalyticsController] Calling analyticsService.getCompanyAnalytics');
      // Get analytics
      const analytics = await analyticsService.getCompanyAnalytics(companyId, dateRange);
      
      console.log('🔍 [AnalyticsController] Analytics service response:', {
        success: analytics.success,
        hasData: !!analytics.data,
        error: analytics.error
      });
      
      if (!analytics.success) {
        console.error('🔍 [AnalyticsController] Analytics service failed:', analytics.error);
        return errorResponse(res, analytics.error, 500);
      }

      console.log('🔍 [AnalyticsController] Successfully returning analytics data');
      return successResponse(res, 'Analytics retrieved successfully', analytics.data);
    } catch (error) {
      console.error('🔍 [AnalyticsController] getCompanyAnalytics error:', error);
      return errorResponse(res, 'Failed to retrieve analytics', 500);
    }
  }

  /**
   * Generate executive report
   */
  async generateExecutiveReport(req, res) {
    console.log('🔍 [AnalyticsController] generateExecutiveReport called with:', {
      params: req.params,
      query: req.query,
      userId: req.user?.id
    });

    try {
      const { companyId } = req.params;
      const { dateRange = '30d' } = req.query;

      console.log('🔍 [AnalyticsController] Processing executive report request:', { companyId, dateRange });

      // Validate companyId
      if (!companyId) {
        console.error('🔍 [AnalyticsController] Company ID missing for executive report');
        return errorResponse(res, 'Company ID is required', 400);
      }

      // Check if company exists and user has access
      const company = await Company.findById(companyId);
      console.log('🔍 [AnalyticsController] Company lookup for executive report:', { 
        found: !!company, 
        companyId: company?._id 
      });

      if (!company) {
        console.error('🔍 [AnalyticsController] Company not found for executive report:', companyId);
        return errorResponse(res, 'Company not found', 404);
      }

      // Verify user has access to this company
      if (company.userId.toString() !== req.user.id) {
        console.error('🔍 [AnalyticsController] Access denied for executive report');
        return errorResponse(res, 'Access denied', 403);
      }

      console.log('🔍 [AnalyticsController] Calling analyticsService.generateExecutiveReport');
      // Generate executive report
      const report = await analyticsService.generateExecutiveReport(companyId, dateRange);
      
      console.log('🔍 [AnalyticsController] Executive report generation result:', {
        success: report.success,
        hasData: !!report.data,
        error: report.error
      });
      
      if (!report.success) {
        console.error('🔍 [AnalyticsController] Executive report generation failed:', report.error);
        return errorResponse(res, report.error, 500);
      }

      console.log('🔍 [AnalyticsController] Successfully returning executive report');
      return successResponse(res, 'Executive report generated successfully', report.data);
    } catch (error) {
      console.error('🔍 [AnalyticsController] generateExecutiveReport error:', error);
      return errorResponse(res, 'Failed to generate executive report', 500);
    }
  }

  /**
   * Generate PDF report
   */
  async generatePDFReport(req, res) {
    console.log('🔍 [AnalyticsController] generatePDFReport called with:', {
      params: req.params,
      query: req.query,
      userId: req.user?.id
    });

    try {
      const { companyId } = req.params;
      const { reportType = 'comprehensive', dateRange = '30d' } = req.query;

      console.log('🔍 [AnalyticsController] Processing PDF report request:', { companyId, reportType, dateRange });

      // Validate companyId
      if (!companyId) {
        console.error('🔍 [AnalyticsController] Company ID missing for PDF report');
        return errorResponse(res, 'Company ID is required', 400);
      }

      // Validate report type
      const validReportTypes = ['comprehensive', 'executive', 'detailed', 'performance'];
      if (!validReportTypes.includes(reportType)) {
        console.error('🔍 [AnalyticsController] Invalid report type:', reportType);
        return errorResponse(res, 'Invalid report type', 400);
      }

      // Check if company exists and user has access
      const company = await Company.findById(companyId);
      console.log('🔍 [AnalyticsController] Company lookup for PDF report:', { 
        found: !!company, 
        companyId: company?._id 
      });

      if (!company) {
        console.error('🔍 [AnalyticsController] Company not found for PDF report:', companyId);
        return errorResponse(res, 'Company not found', 404);
      }

      // Verify user has access to this company
      if (company.userId.toString() !== req.user.id) {
        console.error('🔍 [AnalyticsController] Access denied for PDF report');
        return errorResponse(res, 'Access denied', 403);
      }

      console.log('🔍 [AnalyticsController] Calling reportingService.generatePDFReport');
      // Generate PDF report
      const report = await reportingService.generatePDFReport(companyId, reportType, dateRange);
      
      console.log('🔍 [AnalyticsController] PDF report generation result:', {
        success: report.success,
        hasData: !!report.data,
        error: report.error
      });
      
      if (!report.success) {
        console.error('🔍 [AnalyticsController] PDF report generation failed:', report.error);
        return errorResponse(res, report.error, 500);
      }

      console.log('🔍 [AnalyticsController] Successfully returning PDF report');
      return successResponse(res, 'PDF report generated successfully', report.data);
    } catch (error) {
      console.error('🔍 [AnalyticsController] generatePDFReport error:', error);
      return errorResponse(res, 'Failed to generate PDF report', 500);
    }
  }

  /**
   * Generate Excel report
   */
  async generateExcelReport(req, res) {
    console.log('🔍 [AnalyticsController] generateExcelReport called with:', {
      params: req.params,
      query: req.query,
      userId: req.user?.id
    });

    try {
      const { companyId } = req.params;
      const { reportType = 'comprehensive', dateRange = '30d' } = req.query;

      console.log('🔍 [AnalyticsController] Processing Excel report request:', { companyId, reportType, dateRange });

      // Validate companyId
      if (!companyId) {
        console.error('🔍 [AnalyticsController] Company ID missing for Excel report');
        return errorResponse(res, 'Company ID is required', 400);
      }

      // Validate report type
      const validReportTypes = ['comprehensive', 'executive', 'detailed', 'performance'];
      if (!validReportTypes.includes(reportType)) {
        console.error('🔍 [AnalyticsController] Invalid report type:', reportType);
        return errorResponse(res, 'Invalid report type', 400);
      }

      // Check if company exists and user has access
      const company = await Company.findById(companyId);
      console.log('🔍 [AnalyticsController] Company lookup for Excel report:', { 
        found: !!company, 
        companyId: company?._id 
      });

      if (!company) {
        console.error('🔍 [AnalyticsController] Company not found for Excel report:', companyId);
        return errorResponse(res, 'Company not found', 404);
      }

      // Verify user has access to this company
      if (company.userId.toString() !== req.user.id) {
        console.error('🔍 [AnalyticsController] Access denied for Excel report');
        return errorResponse(res, 'Access denied', 403);
      }

      console.log('🔍 [AnalyticsController] Calling reportingService.generateExcelReport');
      // Generate Excel report
      const report = await reportingService.generateExcelReport(companyId, reportType, dateRange);
      
      console.log('🔍 [AnalyticsController] Excel report generation result:', {
        success: report.success,
        hasData: !!report.data,
        error: report.error
      });
      
      if (!report.success) {
        console.error('🔍 [AnalyticsController] Excel report generation failed:', report.error);
        return errorResponse(res, report.error, 500);
      }

      console.log('🔍 [AnalyticsController] Successfully returning Excel report');
      return successResponse(res, 'Excel report generated successfully', report.data);
    } catch (error) {
      console.error('🔍 [AnalyticsController] generateExcelReport error:', error);
      return errorResponse(res, 'Failed to generate Excel report', 500);
    }
  }

  /**
   * Download generated report
   */
  async downloadReport(req, res) {
    console.log('🔍 [AnalyticsController] downloadReport called with:', {
      params: req.params,
      userId: req.user?.id
    });

    try {
      const { filename } = req.params;

      console.log('🔍 [AnalyticsController] Processing download request for file:', filename);

      if (!filename) {
        console.error('🔍 [AnalyticsController] Filename missing for download');
        return errorResponse(res, 'Filename is required', 400);
      }

      const filepath = path.join(__dirname, '../../../reports', filename);
      console.log('🔍 [AnalyticsController] Full file path:', filepath);

      // Check if file exists
      if (!require('fs').existsSync(filepath)) {
        console.error('🔍 [AnalyticsController] Report file not found:', filepath);
        return errorResponse(res, 'Report file not found', 404);
      }

      // Get file stats
      const stats = require('fs').statSync(filepath);
      console.log('🔍 [AnalyticsController] File stats:', { size: stats.size, path: filepath });
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', stats.size);

      console.log('🔍 [AnalyticsController] Streaming file for download');
      // Stream the file
      const fileStream = require('fs').createReadStream(filepath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('🔍 [AnalyticsController] downloadReport error:', error);
      return errorResponse(res, 'Failed to download report', 500);
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(req, res) {
    console.log('🔍 [AnalyticsController] getDashboardData called with:', {
      params: req.params,
      query: req.query,
      userId: req.user?.id
    });

    try {
      const { companyId } = req.params;
      const { dateRange = '30d' } = req.query;

      console.log('🔍 [AnalyticsController] Processing dashboard data request:', { companyId, dateRange });

      // Validate companyId
      if (!companyId) {
        console.error('🔍 [AnalyticsController] Company ID missing for dashboard data');
        return errorResponse(res, 'Company ID is required', 400);
      }

      // Check if company exists and user has access
      const company = await Company.findById(companyId);
      console.log('🔍 [AnalyticsController] Company lookup for dashboard data:', { 
        found: !!company, 
        companyId: company?._id 
      });

      if (!company) {
        console.error('🔍 [AnalyticsController] Company not found for dashboard data:', companyId);
        return errorResponse(res, 'Company not found', 404);
      }

      // Verify user has access to this company
      if (company.userId.toString() !== req.user.id) {
        console.error('🔍 [AnalyticsController] Access denied for dashboard data');
        return errorResponse(res, 'Access denied', 403);
      }

      console.log('🔍 [AnalyticsController] Calling analyticsService.getCompanyAnalytics for dashboard');
      // Get analytics for dashboard
      const analytics = await analyticsService.getCompanyAnalytics(companyId, dateRange);
      
      console.log('🔍 [AnalyticsController] Analytics service response for dashboard:', {
        success: analytics.success,
        hasData: !!analytics.data,
        error: analytics.error
      });
      
      if (!analytics.success) {
        console.error('🔍 [AnalyticsController] Analytics service failed for dashboard:', analytics.error);
        return errorResponse(res, analytics.error, 500);
      }

      console.log('🔍 [AnalyticsController] Extracting dashboard-specific data');
      // Extract dashboard-specific data
      const dashboardData = {
        summary: {
          totalOffers: analytics.data.offers?.summary?.totalOffers || 0,
          acceptanceRate: analytics.data.offers?.acceptanceRate || 0,
          avgResponseTime: analytics.data.offers?.summary?.avgResponseTime || 0,
          totalValue: analytics.data.offers?.summary?.totalValue || 0,
          efficiency: analytics.data.performance?.efficiency?.responseTimeEfficiency || 0
        },
        trends: {
          dailyOffers: analytics.data.offers?.dailyTrends?.slice(-7) || [], // Last 7 days
          statusDistribution: analytics.data.offers?.statusDistribution || []
        },
        topTemplates: analytics.data.templates?.topTemplates?.slice(0, 5) || [],
        performance: {
          responseTime: analytics.data.performance?.responseTime || {},
          efficiency: analytics.data.performance?.efficiency || {}
        },
        industryComparison: {
          industry: analytics.data.industryComparison?.industry?.comparison || {},
          companyType: analytics.data.industryComparison?.companyType?.comparison || {}
        }
      };

      console.log('🔍 [AnalyticsController] Dashboard data structure:', {
        summaryKeys: Object.keys(dashboardData.summary),
        trendsKeys: Object.keys(dashboardData.trends),
        hasPerformance: !!dashboardData.performance,
        hasIndustryComparison: !!dashboardData.industryComparison
      });

      console.log('🔍 [AnalyticsController] Successfully returning dashboard data');
      return successResponse(res, 'Dashboard data retrieved successfully', dashboardData);
    } catch (error) {
      console.error('🔍 [AnalyticsController] getDashboardData error:', error);
      return errorResponse(res, 'Failed to retrieve dashboard data', 500);
    }
  }

  /**
   * Get comprehensive dashboard analytics for organisation
   */
  async getOrganisationDashboard(req, res) {
    console.log('🔍 [AnalyticsController] getOrganisationDashboard called with:', {
      query: req.query,
      userId: req.user?.id,
      organisationId: req.user?.organisation
    });

    try {
      const { dateRange = '30d' } = req.query;
      const organisationId = req.user.organisation;

      console.log('🔍 [AnalyticsController] Processing organisation dashboard request:', { 
        organisationId, 
        dateRange,
        userId: req.user.id 
      });

      if (!organisationId) {
        console.error('🔍 [AnalyticsController] No organisation ID found for user');
        return errorResponse(res, 'Organisation not found', 404);
      }

      console.log('🔍 [AnalyticsController] Calling AnalyticsService.getDashboardAnalytics');
      // Get comprehensive dashboard analytics
      const analytics = await AnalyticsService.getDashboardAnalytics(
        organisationId, 
        req.user.id, 
        dateRange
      );
      
      console.log('🔍 [AnalyticsController] Organisation dashboard analytics result:', {
        success: analytics.success,
        hasData: !!analytics.data,
        error: analytics.error
      });
      
      if (!analytics.success) {
        console.error('🔍 [AnalyticsController] Organisation dashboard analytics failed:', analytics.error);
        return errorResponse(res, analytics.error, 500);
      }

      console.log('🔍 [AnalyticsController] Successfully returning organisation dashboard data');
      return successResponse(res, 'Dashboard analytics retrieved successfully', analytics.data);
    } catch (error) {
      console.error('🔍 [AnalyticsController] getOrganisationDashboard error:', error);
      return errorResponse(res, 'Failed to retrieve dashboard analytics', 500);
    }
  }

  /**
   * Get user statistics for dashboard
   */
  async getUserStatistics(req, res) {
    console.log('🔍 [AnalyticsController] getUserStatistics called with:', {
      query: req.query,
      userId: req.user?.id,
      organisationId: req.user?.organisation
    });

    try {
      const { dateRange = '30d' } = req.query;
      const organisationId = req.user.organisation;

      console.log('🔍 [AnalyticsController] Processing user statistics request:', { 
        organisationId, 
        dateRange 
      });

      if (!organisationId) {
        console.error('🔍 [AnalyticsController] No organisation ID found for user statistics');
        return errorResponse(res, 'Organisation not found', 404);
      }

      console.log('🔍 [AnalyticsController] Getting date range and calling getUserStatistics');
      const { startDate, endDate } = AnalyticsService.getDateRange(dateRange);
      const userStats = await AnalyticsService.getUserStatistics(organisationId, startDate, endDate);

      console.log('🔍 [AnalyticsController] User statistics result:', {
        hasData: !!userStats,
        dataKeys: userStats ? Object.keys(userStats) : []
      });

      return successResponse(res, 'User statistics retrieved successfully', userStats);
    } catch (error) {
      console.error('🔍 [AnalyticsController] getUserStatistics error:', error);
      return errorResponse(res, 'Failed to retrieve user statistics', 500);
    }
  }

  /**
   * Get template statistics for dashboard
   */
  async getTemplateStatistics(req, res) {
    console.log('🔍 [AnalyticsController] getTemplateStatistics called with:', {
      query: req.query,
      userId: req.user?.id,
      organisationId: req.user?.organisation
    });

    try {
      const { dateRange = '30d' } = req.query;
      const organisationId = req.user.organisation;

      console.log('🔍 [AnalyticsController] Processing template statistics request:', { 
        organisationId, 
        dateRange 
      });

      if (!organisationId) {
        console.error('🔍 [AnalyticsController] No organisation ID found for template statistics');
        return errorResponse(res, 'Organisation not found', 404);
      }

      console.log('🔍 [AnalyticsController] Getting date range and calling getTemplateStatistics');
      const { startDate, endDate } = AnalyticsService.getDateRange(dateRange);
      const templateStats = await AnalyticsService.getTemplateStatistics(organisationId, startDate, endDate);

      console.log('🔍 [AnalyticsController] Template statistics result:', {
        hasData: !!templateStats,
        dataKeys: templateStats ? Object.keys(templateStats) : []
      });

      return successResponse(res, 'Template statistics retrieved successfully', templateStats);
    } catch (error) {
      console.error('🔍 [AnalyticsController] getTemplateStatistics error:', error);
      return errorResponse(res, 'Failed to retrieve template statistics', 500);
    }
  }

  /**
   * Get offer statistics for dashboard
   */
  async getOfferStatistics(req, res) {
    console.log('🔍 [AnalyticsController] getOfferStatistics called with:', {
      query: req.query,
      userId: req.user?.id,
      organisationId: req.user?.organisation
    });

    try {
      const { dateRange = '30d' } = req.query;
      const organisationId = req.user.organisation;

      console.log('🔍 [AnalyticsController] Processing offer statistics request:', { 
        organisationId, 
        dateRange 
      });

      if (!organisationId) {
        console.error('🔍 [AnalyticsController] No organisation ID found for offer statistics');
        return errorResponse(res, 'Organisation not found', 404);
      }

      console.log('🔍 [AnalyticsController] Getting date range and calling getOfferStatistics');
      const { startDate, endDate } = AnalyticsService.getDateRange(dateRange);
      const offerStats = await AnalyticsService.getOfferStatistics(organisationId, startDate, endDate);

      console.log('🔍 [AnalyticsController] Offer statistics result:', {
        hasData: !!offerStats,
        dataKeys: offerStats ? Object.keys(offerStats) : []
      });

      return successResponse(res, 'Offer statistics retrieved successfully', offerStats);
    } catch (error) {
      console.error('🔍 [AnalyticsController] getOfferStatistics error:', error);
      return errorResponse(res, 'Failed to retrieve offer statistics', 500);
    }
  }

  /**
   * Get company statistics for dashboard
   */
  async getCompanyStatistics(req, res) {
    console.log('🔍 [AnalyticsController] getCompanyStatistics called with:', {
      query: req.query,
      userId: req.user?.id,
      organisationId: req.user?.organisation
    });

    try {
      const { dateRange = '30d' } = req.query;
      const organisationId = req.user.organisation;

      console.log('🔍 [AnalyticsController] Processing company statistics request:', { 
        organisationId, 
        dateRange 
      });

      if (!organisationId) {
        console.error('🔍 [AnalyticsController] No organisation ID found for company statistics');
        return errorResponse(res, 'Organisation not found', 404);
      }

      console.log('🔍 [AnalyticsController] Getting date range and calling getCompanyStatistics');
      const { startDate, endDate } = AnalyticsService.getDateRange(dateRange);
      const companyStats = await AnalyticsService.getCompanyStatistics(organisationId, startDate, endDate);

      console.log('🔍 [AnalyticsController] Company statistics result:', {
        hasData: !!companyStats,
        dataKeys: companyStats ? Object.keys(companyStats) : []
      });

      return successResponse(res, 'Company statistics retrieved successfully', companyStats);
    } catch (error) {
      console.error('🔍 [AnalyticsController] getCompanyStatistics error:', error);
      return errorResponse(res, 'Failed to retrieve company statistics', 500);
    }
  }

  /**
   * Get recent activity for dashboard
   */
  async getRecentActivity(req, res) {
    console.log('🔍 [AnalyticsController] getRecentActivity called with:', {
      query: req.query,
      userId: req.user?.id,
      organisationId: req.user?.organisation
    });

    try {
      const { organisationId, userId, startDate, endDate } = req.query;
      const organisation = req.user?.organisation;

      console.log('🔍 [AnalyticsController] Processing recent activity request:', {
        organisationId: organisation || organisationId,
        dateRange: '30d'
      });

      // Get date range and call getRecentActivity
      const { startDate: start, endDate: end } = AnalyticsService.getDateRange('30d');
      console.log('🔍 [AnalyticsController] Getting date range:', { start, end });

      const recentActivity = await AnalyticsService.getRecentActivity(organisation || organisationId, userId, start, end);
      console.log('🔍 [AnalyticsController] Recent activity result:', recentActivity);

      return successResponse(res, 'Recent activity retrieved successfully', recentActivity);
    } catch (error) {
      console.error('🔍 [AnalyticsController] getRecentActivity error:', error);
      return errorResponse(res, 'Failed to retrieve recent activity', 500);
    }
  }

  /**
   * Get available export options for reports
   */
  async getExportOptions(req, res) {
    console.log('🔍 [AnalyticsController] getExportOptions called with:', {
      query: req.query,
      userId: req.user?.id,
      organisationId: req.user?.organisation
    });

    try {
      const organisation = req.user?.organisation;

      const exportOptions = {
        reportTypes: [
          { value: 'comprehensive', label: 'Comprehensive Report', description: 'Full analytics overview with all metrics' },
          { value: 'executive', label: 'Executive Summary', description: 'High-level insights for stakeholders' },
          { value: 'detailed', label: 'Detailed Analytics', description: 'In-depth analysis with charts and trends' },
          { value: 'performance', label: 'Performance Report', description: 'Focus on KPIs and performance metrics' }
        ],
        formats: [
          { value: 'both', label: 'PDF + Excel', description: 'Both formats for maximum flexibility' },
          { value: 'pdf', label: 'PDF Only', description: 'Professional document format' },
          { value: 'excel', label: 'Excel Only', description: 'Data analysis and manipulation' }
        ],
        dateRanges: [
          { value: '7', label: 'Last 7 Days', description: 'Weekly performance snapshot' },
          { value: '30', label: 'Last 30 Days', description: 'Monthly performance overview' },
          { value: '90', label: 'Last 90 Days', description: 'Quarterly performance analysis' },
          { value: 'custom', label: 'Custom Range', description: 'Select specific start and end dates' }
        ],
        availableMetrics: [
          'user_statistics',
          'template_usage',
          'offer_performance',
          'company_analytics',
          'recent_activity',
          'growth_trends',
          'compliance_metrics'
        ]
      };

      console.log('🔍 [AnalyticsController] Export options result:', exportOptions);
      return successResponse(res, 'Export options retrieved successfully', exportOptions);
    } catch (error) {
      console.error('🔍 [AnalyticsController] getExportOptions error:', error);
      return errorResponse(res, 'Failed to retrieve export options', 500);
    }
  }

  /**
   * Generate and download analytics report
   */
  async generateReport(req, res) {
    console.log('🔍 [AnalyticsController] generateReport called with:', {
      body: req.body,
      userId: req.user?.id,
      organisationId: req.user?.organisation
    });

    try {
      const { reportType, format, startDate, endDate, metrics } = req.body;
      const organisation = req.user?.organisation;
      const userId = req.user?.id;

      console.log('🔍 [AnalyticsController] Processing report generation:', {
        reportType,
        format,
        startDate,
        endDate,
        metrics,
        organisation,
        userId
      });

      // Validate required fields
      if (!reportType || !format) {
        return errorResponse(res, 'Report type and format are required', 400);
      }

      // Generate report based on type and format
      let reportData = {};
      let downloadUrl = '';

      if (format === 'pdf' || format === 'both') {
        // Generate PDF report
        const pdfReport = await AnalyticsService.generatePDFReport(
          organisation,
          reportType,
          { startDate, endDate, metrics, userId }
        );
        reportData.pdf = pdfReport;
        downloadUrl = pdfReport.downloadUrl;
      }

      if (format === 'excel' || format === 'both') {
        // Generate Excel report
        const excelReport = await AnalyticsService.generateExcelReport(
          organisation,
          reportType,
          { startDate, endDate, metrics, userId }
        );
        reportData.excel = excelReport;
        if (!downloadUrl) downloadUrl = excelReport.downloadUrl;
      }

      // Save report metadata
      const reportMetadata = {
        id: Date.now().toString(),
        type: reportType,
        format,
        dateRange: { startDate, endDate },
        generatedAt: new Date(),
        organisationId: organisation,
        userId,
        downloadUrl
      };

      console.log('🔍 [AnalyticsController] Report generated successfully:', reportMetadata);
      return successResponse(res, 'Report generated successfully', {
        reportId: reportMetadata.id,
        downloadUrl,
        metadata: reportMetadata
      });

    } catch (error) {
      console.error('🔍 [AnalyticsController] generateReport error:', error);
      return errorResponse(res, 'Failed to generate report', 500);
    }
  }

  /**
   * Get analytics insights
   */
  async getAnalyticsInsights(req, res) {
    console.log('🔍 [AnalyticsController] getAnalyticsInsights called with:', {
      params: req.params,
      query: req.query,
      userId: req.user?.id
    });

    try {
      const { companyId } = req.params;
      const { dateRange = '30d' } = req.query;

      console.log('🔍 [AnalyticsController] Processing insights request:', { companyId, dateRange });

      // Validate companyId
      if (!companyId) {
        console.error('🔍 [AnalyticsController] Company ID missing for insights');
        return errorResponse(res, 'Company ID is required', 400);
      }

      // Check if company exists and user has access
      const company = await Company.findById(companyId);
      console.log('🔍 [AnalyticsController] Company lookup for insights:', { 
        found: !!company, 
        companyId: company?._id 
      });

      if (!company) {
        console.error('🔍 [AnalyticsController] Company not found for insights:', companyId);
        return errorResponse(res, 'Company not found', 404);
      }

      // Verify user has access to this company
      if (company.userId.toString() !== req.user.id) {
        console.error('🔍 [AnalyticsController] Access denied for insights');
        return errorResponse(res, 'Access denied', 403);
      }

      console.log('🔍 [AnalyticsController] Calling analyticsService.getCompanyAnalytics for insights');
      // Get analytics
      const analytics = await analyticsService.getCompanyAnalytics(companyId, dateRange);
      
      console.log('🔍 [AnalyticsController] Analytics service response for insights:', {
        success: analytics.success,
        hasData: !!analytics.data,
        error: analytics.error
      });
      
      if (!analytics.success) {
        console.error('🔍 [AnalyticsController] Analytics service failed for insights:', analytics.error);
        return errorResponse(res, analytics.error, 500);
      }

      console.log('🔍 [AnalyticsController] Generating insights and recommendations');
      // Generate insights and recommendations
      const insights = analyticsService.generateInsights(
        analytics.data.offers, 
        analytics.data.performance, 
        analytics.data.industryComparison
      );
      
      const recommendations = analyticsService.generateRecommendations(
        analytics.data.offers, 
        analytics.data.performance, 
        analytics.data.industryComparison
      );

      // Assess risks
      const riskAssessment = analyticsService.assessRisks(
        analytics.data.offers, 
        analytics.data.performance
      );

      const insightsData = {
        insights,
        recommendations,
        riskAssessment,
        period: analytics.data.period
      };

      console.log('🔍 [AnalyticsController] Insights data generated:', {
        insightsCount: insights?.length || 0,
        recommendationsCount: recommendations?.length || 0,
        hasRiskAssessment: !!riskAssessment
      });

      console.log('🔍 [AnalyticsController] Successfully returning insights data');
      return successResponse(res, 'Insights retrieved successfully', insightsData);
    } catch (error) {
      console.error('🔍 [AnalyticsController] getAnalyticsInsights error:', error);
      return errorResponse(res, 'Failed to retrieve insights', 500);
    }
  }

  /**
   * Get analytics comparison data
   */
  async getAnalyticsComparison(req, res) {
    console.log('🔍 [AnalyticsController] getAnalyticsComparison called with:', {
      params: req.params,
      query: req.query,
      userId: req.user?.id
    });

    try {
      const { companyId } = req.params;
      const { compareWith = 'industry', dateRange = '30d' } = req.query;

      console.log('🔍 [AnalyticsController] Processing comparison request:', { companyId, compareWith, dateRange });

      // Validate companyId
      if (!companyId) {
        console.error('🔍 [AnalyticsController] Company ID missing for comparison');
        return errorResponse(res, 'Company ID is required', 400);
      }

      // Validate comparison type
      const validComparisonTypes = ['industry', 'companyType', 'both'];
      if (!validComparisonTypes.includes(compareWith)) {
        console.error('🔍 [AnalyticsController] Invalid comparison type:', compareWith);
        return errorResponse(res, 'Invalid comparison type', 400);
      }

      // Check if company exists and user has access
      const company = await Company.findById(companyId);
      console.log('🔍 [AnalyticsController] Company lookup for comparison:', { 
        found: !!company, 
        companyId: company?._id 
      });

      if (!company) {
        console.error('🔍 [AnalyticsController] Company not found for comparison:', companyId);
        return errorResponse(res, 'Company not found', 404);
      }

      // Verify user has access to this company
      if (company.userId.toString() !== req.user.id) {
        console.error('🔍 [AnalyticsController] Access denied for comparison');
        return errorResponse(res, 'Access denied', 403);
      }

      console.log('🔍 [AnalyticsController] Calling analyticsService.getCompanyAnalytics for comparison');
      // Get analytics
      const analytics = await analyticsService.getCompanyAnalytics(companyId, dateRange);
      
      console.log('🔍 [AnalyticsController] Analytics service response for comparison:', {
        success: analytics.success,
        hasData: !!analytics.data,
        error: analytics.error
      });
      
      if (!analytics.success) {
        console.error('🔍 [AnalyticsController] Analytics service failed for comparison:', analytics.error);
        return errorResponse(res, analytics.error, 500);
      }

      console.log('🔍 [AnalyticsController] Extracting comparison data for:', compareWith);
      // Extract comparison data
      let comparisonData = {};
      
      if (compareWith === 'industry' || compareWith === 'both') {
        comparisonData.industry = {
          name: analytics.data.industryComparison?.industry?.name || 'Unknown',
          benchmarks: analytics.data.industryComparison?.industry?.benchmarks || {},
          companyPerformance: analytics.data.industryComparison?.industry?.companyPerformance || {},
          comparison: analytics.data.industryComparison?.industry?.comparison || {}
        };
      }

      if (compareWith === 'companyType' || compareWith === 'both') {
        comparisonData.companyType = {
          name: analytics.data.industryComparison?.companyType?.name || 'Unknown',
          benchmarks: analytics.data.industryComparison?.companyType?.benchmarks || {},
          companyPerformance: analytics.data.industryComparison?.companyType?.companyPerformance || {},
          comparison: analytics.data.industryComparison?.companyType?.comparison || {}
        };
      }

      console.log('🔍 [AnalyticsController] Comparison data structure:', {
        hasIndustry: !!comparisonData.industry,
        hasCompanyType: !!comparisonData.companyType,
        dataKeys: Object.keys(comparisonData)
      });

      console.log('🔍 [AnalyticsController] Successfully returning comparison data');
      return successResponse(res, 'Comparison data retrieved successfully', comparisonData);
    } catch (error) {
      console.error('🔍 [AnalyticsController] getAnalyticsComparison error:', error);
      return errorResponse(res, 'Failed to retrieve comparison data', 500);
    }
  }

  /**
   * Clean up old reports
   */
  async cleanupOldReports(req, res) {
    console.log('🔍 [AnalyticsController] cleanupOldReports called with:', {
      query: req.query,
      userId: req.user?.id
    });

    try {
      const { maxAge = '7d' } = req.query;

      console.log('🔍 [AnalyticsController] Processing cleanup request with maxAge:', maxAge);

      // Convert maxAge to milliseconds
      let maxAgeMs = 7 * 24 * 60 * 60 * 1000; // Default 7 days
      
      if (maxAge === '1d') maxAgeMs = 24 * 60 * 60 * 1000;
      else if (maxAge === '3d') maxAgeMs = 3 * 24 * 60 * 60 * 1000;
      else if (maxAge === '30d') maxAgeMs = 30 * 24 * 60 * 60 * 1000;

      console.log('🔍 [AnalyticsController] Converted maxAge to milliseconds:', maxAgeMs);

      console.log('🔍 [AnalyticsController] Calling reportingService.cleanupOldReports');
      // Clean up old reports
      const cleanup = await reportingService.cleanupOldReports(maxAgeMs);
      
      console.log('🔍 [AnalyticsController] Cleanup result:', {
        success: cleanup.success,
        hasData: !!cleanup.data,
        error: cleanup.error
      });
      
      if (!cleanup.success) {
        console.error('🔍 [AnalyticsController] Cleanup failed:', cleanup.error);
        return errorResponse(res, cleanup.error, 500);
      }

      console.log('🔍 [AnalyticsController] Successfully cleaned up old reports');
      return successResponse(res, 'Old reports cleaned up successfully', cleanup.data);
    } catch (error) {
      console.error('🔍 [AnalyticsController] cleanupOldReports error:', error);
      return errorResponse(res, 'Failed to cleanup old reports', 500);
    }
  }
}

module.exports = new AnalyticsController();
