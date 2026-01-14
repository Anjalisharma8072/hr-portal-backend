const GeneratedOffer = require('../model/generatedOffer');
const Template = require('../model/template');
const Company = require('../model/company');
const Organisation = require('../../organisation/model/organisation');
const User = require('../../user/model/user');
 
class AnalyticsService {
  /**
   * Get comprehensive analytics for a company
   */
  async getCompanyAnalytics(companyId, dateRange = '30d') {
    try {
      const { startDate, endDate } = AnalyticsService.getDateRange(dateRange);
      
      const [
        offerMetrics,
        templateMetrics,
        performanceMetrics,
        industryComparison
      ] = await Promise.all([
        this.getOfferMetrics(companyId, startDate, endDate),
        this.getTemplateMetrics(companyId, startDate, endDate),
        this.getPerformanceMetrics(companyId, startDate, endDate),
        this.getIndustryComparison(companyId, startDate, endDate)
      ]);

      return {
        success: true,
        data: {
          period: { startDate, endDate, range: dateRange },
          offers: offerMetrics,
          templates: templateMetrics,
          performance: performanceMetrics,
          industryComparison
        }
      };
    } catch (error) {
      console.error('Analytics Service Error:', error);
      return {
        success: false,
        error: 'Failed to generate analytics',
        details: error.message
      };
    }
  }

  /**
   * Get comprehensive dashboard analytics for organisation
   */
  static async getDashboardAnalytics(organisationId, userId, dateRange) {
    console.log('🔍 [AnalyticsService] getDashboardAnalytics called with:', {
      organisationId,
      userId,
      dateRange
    });

    try {
      // Get date range
      const { startDate, endDate } = AnalyticsService.getDateRange(dateRange);
      console.log('🔍 [AnalyticsService] Date range:', { startDate, endDate });

      // Get all analytics data
      const [
        userStats,
        templateStats,
        offerStats,
        companyStats,
        recentActivity
      ] = await Promise.all([
        AnalyticsService.getUserStatistics(organisationId, startDate, endDate),
        AnalyticsService.getTemplateStatistics(organisationId, startDate, endDate),
        AnalyticsService.getOfferStatistics(organisationId, startDate, endDate),
        AnalyticsService.getCompanyStatistics(organisationId, startDate, endDate),
        AnalyticsService.getRecentActivity(organisationId, userId, startDate, endDate)
      ]);

      console.log('🔍 [AnalyticsService] All analytics data fetched:', {
        hasUserStats: !!userStats,
        hasTemplateStats: !!templateStats,
        hasOfferStats: !!offerStats,
        hasCompanyStats: !!companyStats,
        hasRecentActivity: !!recentActivity
      });

      // Combine all data
      const dashboardData = {
        userStats,
        templateStats,
        offerStats,
        companyStats,
        recentActivity,
        period: {
          startDate,
          endDate,
          dateRange
        }
      };

      console.log('🔍 [AnalyticsService] Dashboard data structure:', {
        dataKeys: Object.keys(dashboardData),
        hasData: !!dashboardData
      });

      return {
        success: true,
        data: dashboardData,
        error: null
      };

    } catch (error) {
      console.error('🔍 [AnalyticsService] getDashboardAnalytics error:', error);
      return {
        success: false,
        data: null,
        error: 'Failed to generate dashboard analytics'
      };
    }
  }

  /**
   * Get user statistics for dashboard
   */
  static async getUserStatistics(organisationId, startDate, endDate) {
    try {
      // Total users in organisation
      const totalUsers = await User.countDocuments({ organisation: organisationId });
      
      // Active users
      const activeUsers = await User.countDocuments({ 
        organisation: organisationId, 
        status: 'active' 
      });
      
      // New users this month
      const newUsersThisMonth = await User.countDocuments({
        organisation: organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      // User growth rate
      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - (endDate - startDate) / (1000 * 60 * 60 * 24));
      const previousPeriodEnd = new Date(startDate);
      
      const previousPeriodUsers = await User.countDocuments({
        organisation: organisationId,
        createdAt: { $gte: previousPeriodStart, $lte: previousPeriodEnd }
      });
      
      const userGrowthRate = previousPeriodUsers > 0 ? 
        ((newUsersThisMonth - previousPeriodUsers) / previousPeriodUsers * 100).toFixed(1) : 0;

      // User role distribution
      const userRoleDistribution = await User.aggregate([
        { $match: { organisation: organisationId } },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]);

      // User activity trends
      const userActivityTrends = await User.aggregate([
        { $match: { organisation: organisationId } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        userGrowthRate: parseFloat(userGrowthRate),
        userRoleDistribution,
        userActivityTrends,
        activeUserRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('User Statistics Error:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        userGrowthRate: 0,
        userRoleDistribution: [],
        userActivityTrends: [],
        activeUserRate: 0
      };
    }
  }

  /**
   * Get template statistics for dashboard
   */
  static async getTemplateStatistics(organisationId, startDate, endDate) {
    try {
      // Total templates
      const totalTemplates = await Template.countDocuments({
        'metadata.organisation': organisationId,
        isActive: true
      });
      
      // Active templates
      const activeTemplates = await Template.countDocuments({
        'metadata.organisation': organisationId,
        isActive: true
      });
      
      // Templates created this month
      const templatesCreatedThisMonth = await Template.countDocuments({
        'metadata.organisation': organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      // Template usage statistics
      const templateUsage = await Template.aggregate([
        {
          $lookup: {
            from: 'generatedoffers',
            localField: '_id',
            foreignField: 'templateId',
            as: 'offers'
          }
        },
        {
          $match: {
            'metadata.organisation': organisationId,
            isActive: true
          }
        },
        {
          $project: {
            name: 1,
            category: 1,
            industry: 1,
            usageCount: { $size: '$offers' },
            lastUsed: { $max: '$offers.createdAt' }
          }
        },
        { $sort: { usageCount: -1 } }
      ]);

      // Most used template
      const mostUsedTemplate = templateUsage.length > 0 ? templateUsage[0] : null;
      
      // Template usage rate
      const totalUsage = templateUsage.reduce((sum, t) => sum + t.usageCount, 0);
      const templateUsageRate = totalTemplates > 0 ? 
        ((totalUsage / totalTemplates) * 100).toFixed(1) : 0;

      // Template categories performance
      const categoryPerformance = await Template.aggregate([
        {
          $lookup: {
            from: 'generatedoffers',
            localField: '_id',
            foreignField: 'templateId',
            as: 'offers'
          }
        },
        {
          $match: {
            'metadata.organisation': organisationId,
            isActive: true
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalUsage: { $sum: { $size: '$offers' } }
          }
        }
      ]);

      // Template complexity distribution
      const complexityDistribution = await Template.aggregate([
        {
          $match: {
            'metadata.organisation': organisationId,
            isActive: true
          }
        },
        {
          $group: {
            _id: '$metadata.complexity',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        totalTemplates,
        activeTemplates,
        templatesCreatedThisMonth,
        mostUsedTemplate: mostUsedTemplate?.name || 'N/A',
        templateUsageRate: parseFloat(templateUsageRate),
        topTemplates: templateUsage.slice(0, 5),
        categoryPerformance,
        complexityDistribution,
        avgUsagePerTemplate: totalTemplates > 0 ? (totalUsage / totalTemplates).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Template Statistics Error:', error);
      return {
        totalTemplates: 0,
        activeTemplates: 0,
        templatesCreatedThisMonth: 0,
        mostUsedTemplate: 'N/A',
        templateUsageRate: 0,
        topTemplates: [],
        categoryPerformance: [],
        complexityDistribution: [],
        avgUsagePerTemplate: 0
      };
    }
  }

  /**
   * Get offer statistics for dashboard
   */
  static async getOfferStatistics(organisationId, startDate, endDate) {
    try {
      const matchStage = {
        'metadata.organisation': organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      };

      // Basic offer metrics
      const [metrics] = await GeneratedOffer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalOffers: { $sum: 1 },
            acceptedOffers: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            pendingOffers: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
            sentOffers: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            rejectedOffers: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            totalValue: { $sum: '$salaryBreakdown.ctc.annual' },
            avgOfferValue: { $avg: '$salaryBreakdown.ctc.annual' }
          }
        }
      ]);

      const offerMetrics = metrics || {
        totalOffers: 0,
        acceptedOffers: 0,
        pendingOffers: 0,
        sentOffers: 0,
        rejectedOffers: 0,
        totalValue: 0,
        avgOfferValue: 0
      };

      // Offers this month
      const offersThisMonth = offerMetrics.totalOffers;
      
      // Acceptance rate
      const acceptanceRate = offerMetrics.totalOffers > 0 ? 
        ((offerMetrics.acceptedOffers / offerMetrics.totalOffers) * 100).toFixed(1) : 0;

      // Daily offer trends
      const dailyTrends = await GeneratedOffer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            value: { $sum: '$salaryBreakdown.ctc.annual' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Status distribution
      const statusDistribution = await GeneratedOffer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            percentage: { $avg: 1 }
          }
        }
      ]);

      // Monthly offer trends
      const monthlyTrends = await GeneratedOffer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
            value: { $sum: '$salaryBreakdown.ctc.annual' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Top performing designations
      const topDesignations = await GeneratedOffer.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$candidateData.designation',
            count: { $sum: 1 },
            avgSalary: { $avg: '$salaryBreakdown.ctc.annual' },
            acceptanceRate: {
              $avg: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        totalOffers: offerMetrics.totalOffers,
        offersThisMonth,
        acceptedOffers: offerMetrics.acceptedOffers,
        pendingOffers: offerMetrics.pendingOffers,
        sentOffers: offerMetrics.sentOffers,
        rejectedOffers: offerMetrics.rejectedOffers,
        acceptanceRate: parseFloat(acceptanceRate),
        totalValue: offerMetrics.totalValue,
        avgOfferValue: offerMetrics.avgOfferValue,
        dailyTrends,
        monthlyTrends,
        statusDistribution,
        topDesignations
      };
    } catch (error) {
      console.error('Offer Statistics Error:', error);
      return {
        totalOffers: 0,
        offersThisMonth: 0,
        acceptedOffers: 0,
        pendingOffers: 0,
        sentOffers: 0,
        rejectedOffers: 0,
        acceptanceRate: 0,
        totalValue: 0,
        avgOfferValue: 0,
        dailyTrends: [],
        monthlyTrends: [],
        statusDistribution: [],
        topDesignations: []
      };
    }
  }

  /**
   * Get company statistics for dashboard
   */
  static async getCompanyStatistics(organisationId, startDate, endDate) {
    try {
      // Total companies
      const totalCompanies = await Company.countDocuments({
        organisation: organisationId,
        isActive: true
      });
      
      // Active companies
      const activeCompanies = await Company.countDocuments({
        organisation: organisationId,
        isActive: true
      });
      
      // Company industry distribution
      const industryDistribution = await Company.aggregate([
        {
          $match: {
            organisation: organisationId,
            isActive: true
          }
        },
        {
          $group: {
            _id: { $ifNull: ['$profile.industry', 'Unknown'] },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      // Company type distribution
      const companyTypeDistribution = await Company.aggregate([
        {
          $match: {
            organisation: organisationId,
            isActive: true
          }
        },
        {
          $group: {
            _id: { $ifNull: ['$profile.companyType', 'Unknown'] },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      // Employee count distribution
      const employeeCountDistribution = await Company.aggregate([
        {
          $match: {
            organisation: organisationId,
            isActive: true
          }
        },
        {
          $group: {
            _id: { $ifNull: ['$profile.employeeCount', 'Unknown'] },
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Compliance status
      const complianceStatus = await Company.aggregate([
        {
          $match: {
            organisation: organisationId,
            isActive: true
          }
        },
        {
          $group: {
            _id: null,
            compliantCount: { 
              $sum: { 
                $cond: [
                  { $gt: [{ $size: { $ifNull: ['$compliance', []] } }, 0] }, 
                  1, 
                  0
                ] 
              } 
            },
            totalCount: { $sum: 1 }
          }
        }
      ]);

      const complianceRate = complianceStatus.length > 0 && complianceStatus[0].totalCount > 0 ?
        ((complianceStatus[0].compliantCount / complianceStatus[0].totalCount) * 100).toFixed(1) : 0;

      // Company growth trends
      const companyGrowthTrends = await Company.aggregate([
        {
          $match: {
            organisation: organisationId,
            isActive: true,
            createdAt: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return {
        totalCompanies,
        activeCompanies,
        industries: industryDistribution.map(i => i._id),
        companyTypes: companyTypeDistribution.map(t => t._id),
        complianceRate: parseFloat(complianceRate),
        industryDistribution,
        companyTypeDistribution,
        employeeCountDistribution,
        companyGrowthTrends
      };
    } catch (error) {
      console.error('Company Statistics Error:', error);
      return {
        totalCompanies: 0,
        activeCompanies: 0,
        industries: [],
        companyTypes: [],
        complianceRate: 0,
        industryDistribution: [],
        companyTypeDistribution: [],
        employeeCountDistribution: [],
        companyGrowthTrends: []
      };
    }
  }

  /**
   * Get recent activity for dashboard
   */
  static async getRecentActivity(organisationId, userId, startDate, endDate) {
    console.log('🔍 [AnalyticsService] getRecentActivity called with:', {
      organisationId,
      userId,
      startDate,
      endDate
    });

    try {
      // Get recent offers
      const recentOffers = await GeneratedOffer.find({
        organisation: organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('template', 'name')
        .populate('company', 'name');

      // Get recent templates
      const recentTemplates = await Template.find({
        organisation: organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt');

      // Get recent companies
      const recentCompanies = await Company.find({
        organisation: organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt');

      // Combine and format recent activity
      const activities = [];

      // Add offer activities
      recentOffers.forEach(offer => {
        activities.push({
          id: offer._id,
          type: 'offer_generated',
          title: `Offer Generated for ${offer.company?.name || 'Company'}`,
          description: `Generated using template: ${offer.template?.name || 'Unknown Template'}`,
          timestamp: offer.createdAt,
          status: offer.status || 'completed',
          metadata: {
            offerId: offer._id,
            companyName: offer.company?.name,
            templateName: offer.template?.name,
            value: offer.totalValue
          }
        });
      });

      // Add template activities
      recentTemplates.forEach(template => {
        activities.push({
          id: template._id,
          type: 'template_created',
          title: `Template Created: ${template.name}`,
          description: 'New offer template added to library',
          timestamp: template.createdAt,
          status: 'completed',
          metadata: {
            templateId: template._id,
            templateName: template.name
          }
        });
      });

      // Add company activities
      recentCompanies.forEach(company => {
        activities.push({
          id: company._id,
          type: 'company_setup',
          title: `Company Setup: ${company.name}`,
          description: 'New company profile created',
          timestamp: company.createdAt,
          status: 'completed',
          metadata: {
            companyId: company._id,
            companyName: company.name
          }
        });
      });

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('🔍 [AnalyticsService] Recent activity result:', {
        totalActivities: activities.length,
        activities: activities.slice(0, 3) // Log first 3 for debugging
      });

      return activities;
    } catch (error) {
      console.error('🔍 [AnalyticsService] getRecentActivity error:', error);
      throw error;
    }
  }

  /**
   * Generate PDF report
   */
  static async generatePDFReport(organisationId, reportType, options = {}) {
    console.log('🔍 [AnalyticsService] generatePDFReport called with:', {
      organisationId,
      reportType,
      options
    });

    try {
      const { startDate, endDate, metrics, userId } = options;
      
      // For now, return a mock PDF report
      // In production, you would use a library like Puppeteer or jsPDF
      const reportData = {
        reportId: `pdf_${Date.now()}`,
        type: reportType,
        format: 'pdf',
        generatedAt: new Date(),
        downloadUrl: `/api/user/analytics/download-report/pdf_${Date.now()}`,
        content: {
          title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Analytics Report`,
          organisationId,
          dateRange: { startDate, endDate },
          generatedBy: userId,
          sections: metrics || ['overview', 'performance', 'trends']
        }
      };

      console.log('🔍 [AnalyticsService] PDF report generated:', reportData);
      return reportData;
    } catch (error) {
      console.error('🔍 [AnalyticsService] generatePDFReport error:', error);
      throw error;
    }
  }

  /**
   * Generate Excel report
   */
  static async generateExcelReport(organisationId, reportType, options = {}) {
    console.log('🔍 [AnalyticsService] generateExcelReport called with:', {
      organisationId,
      reportType,
      options
    });

    try {
      const { startDate, endDate, metrics, userId } = options;
      
      // For now, return a mock Excel report
      // In production, you would use a library like ExcelJS or xlsx
      const reportData = {
        reportId: `excel_${Date.now()}`,
        type: reportType,
        format: 'excel',
        generatedAt: new Date(),
        downloadUrl: `/api/user/analytics/download-report/excel_${Date.now()}`,
        content: {
          title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Analytics Report`,
          organisationId,
          dateRange: { startDate, endDate },
          generatedBy: userId,
          sheets: metrics || ['Summary', 'Details', 'Charts']
        }
      };

      console.log('🔍 [AnalyticsService] Excel report generated:', reportData);
      return reportData;
    } catch (error) {
      console.error('🔍 [AnalyticsService] generateExcelReport error:', error);
      throw error;
    }
  }

  /**
   * Get offer-related metrics
   */
  async getOfferMetrics(companyId, startDate, endDate) {
    const matchStage = {
      'companyData.companyId': companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOffers: { $sum: 1 },
          acceptedOffers: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          pendingOffers: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          rejectedOffers: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          expiredOffers: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
          totalValue: { $sum: '$salaryBreakdown.totalCTC' },
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ];

    const [metrics] = await GeneratedOffer.aggregate(pipeline);
    
    // Get daily offer trends
    const dailyTrends = await GeneratedOffer.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          value: { $sum: '$salaryBreakdown.totalCTC' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get status distribution
    const statusDistribution = await GeneratedOffer.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          percentage: { $avg: 1 }
        }
      }
    ]);

    return {
      summary: metrics || {
        totalOffers: 0,
        acceptedOffers: 0,
        pendingOffers: 0,
        rejectedOffers: 0,
        expiredOffers: 0,
        totalValue: 0,
        avgResponseTime: 0
      },
      dailyTrends,
      statusDistribution,
      acceptanceRate: metrics ? (metrics.acceptedOffers / metrics.totalOffers * 100).toFixed(2) : 0,
      avgOfferValue: metrics ? (metrics.totalValue / metrics.totalOffers).toFixed(2) : 0
    };
  }

  /**
   * Get template performance metrics
   */
  async getTemplateMetrics(companyId, startDate, endDate) {
    const pipeline = [
      {
        $lookup: {
          from: 'generatedoffers',
          localField: '_id',
          foreignField: 'templateId',
          as: 'offers'
        }
      },
      {
        $match: {
          'offers.companyData.companyId': companyId,
          'offers.createdAt': { $gte: startDate, $lte: endDate }
        }
      },
      {
        $project: {
          name: 1,
          industry: 1,
          companyType: 1,
          usageCount: { $size: '$offers' },
          avgSalary: { $avg: '$offers.salaryBreakdown.totalCTC' },
          acceptanceRate: {
            $cond: [
              { $gt: [{ $size: '$offers' }, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      { $size: { $filter: { input: '$offers', cond: { $eq: ['$$this.status', 'accepted'] } } } },
                      { $size: '$offers' }
                    ]
                  },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { usageCount: -1 } }
    ];

    const templateMetrics = await Template.aggregate(pipeline);

    // Get template categories performance
    const categoryPerformance = await Template.aggregate([
      {
        $lookup: {
          from: 'generatedoffers',
          localField: '_id',
          foreignField: 'templateId',
          as: 'offers'
        }
      },
      {
        $match: {
          'offers.companyData.companyId': companyId,
          'offers.createdAt': { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalUsage: { $sum: { $size: '$offers' } },
          avgAcceptanceRate: { $avg: '$acceptanceRate' }
        }
      }
    ]);

    return {
      topTemplates: templateMetrics.slice(0, 10),
      categoryPerformance,
      totalTemplates: templateMetrics.length,
      avgUsagePerTemplate: templateMetrics.length > 0 ? 
        (templateMetrics.reduce((sum, t) => sum + t.usageCount, 0) / templateMetrics.length).toFixed(2) : 0
    };
  }

  /**
   * Get performance metrics (response times, conversion rates)
   */
  async getPerformanceMetrics(companyId, startDate, endDate) {
    const matchStage = {
      'companyData.companyId': companyId,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    // Response time analysis
    const responseTimeAnalysis = await GeneratedOffer.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          responseTimeDistribution: {
            $push: {
              $cond: [
                { $lt: ['$responseTime', 24] },
                'same_day',
                {
                  $cond: [
                    { $lt: ['$responseTime', 72] },
                    'within_3_days',
                    'more_than_3_days'
                  ]
                }
              ]
            }
          }
        }
      }
    ]);

    // Conversion funnel
    const conversionFunnel = await GeneratedOffer.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Time-based performance
    const timePerformance = await GeneratedOffer.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            dayOfWeek: { $dayOfWeek: '$createdAt' }
          },
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      { $sort: { '_id.hour': 1, '_id.dayOfWeek': 1 } }
    ]);

    return {
      responseTime: responseTimeAnalysis[0] || {
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0
      },
      conversionFunnel,
      timePerformance,
      efficiency: {
        avgResponseTime: responseTimeAnalysis[0]?.avgResponseTime || 0,
        responseTimeEfficiency: responseTimeAnalysis[0] ? 
          (responseTimeAnalysis[0].avgResponseTime < 24 ? 'Excellent' : 
           responseTimeAnalysis[0].avgResponseTime < 72 ? 'Good' : 'Needs Improvement') : 'N/A'
      }
    };
  }

  /**
   * Compare company performance with industry standards
   */
  async getIndustryComparison(companyId, startDate, endDate) {
    // Get company details
    const company = await Company.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const { industry, companyType } = company.profile;

    // Industry benchmarks
    const industryBenchmarks = await GeneratedOffer.aggregate([
      {
        $match: {
          'companyData.industry': industry,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          avgAcceptanceRate: {
            $avg: {
              $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
            }
          },
          avgSalary: { $avg: '$salaryBreakdown.totalCTC' },
          totalOffers: { $sum: 1 }
        }
      }
    ]);

    // Company type benchmarks
    const companyTypeBenchmarks = await GeneratedOffer.aggregate([
      {
        $match: {
          'companyData.companyType': companyType,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          avgAcceptanceRate: {
            $avg: {
              $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
            }
          },
          avgSalary: { $avg: '$salaryBreakdown.totalCTC' },
          totalOffers: { $sum: 1 }
        }
      }
    ]);

    // Company performance
    const companyPerformance = await GeneratedOffer.aggregate([
      {
        $match: {
          'companyData.companyId': companyId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          avgAcceptanceRate: {
            $avg: {
              $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
            }
          },
          avgSalary: { $avg: '$salaryBreakdown.totalCTC' },
          totalOffers: { $sum: 1 }
        }
      }
    ]);

    const industryBench = industryBenchmarks[0] || {};
    const typeBench = companyTypeBenchmarks[0] || {};
    const companyPerf = companyPerformance[0] || {};

    return {
      industry: {
        name: industry,
        benchmarks: industryBench,
        companyPerformance: companyPerf,
        comparison: this.compareMetrics(companyPerf, industryBench)
      },
      companyType: {
        name: companyType,
        benchmarks: typeBench,
        companyPerformance: companyPerf,
        comparison: this.compareMetrics(companyPerf, typeBench)
      }
    };
  }

  /**
   * Compare company metrics with benchmarks
   */
  compareMetrics(company, benchmark) {
    if (!company || !benchmark) return {};

    const compare = (companyVal, benchmarkVal, metric) => {
      if (!companyVal || !benchmarkVal) return 'N/A';
      
      const diff = ((companyVal - benchmarkVal) / benchmarkVal) * 100;
      
      if (metric === 'responseTime') {
        // Lower response time is better
        if (diff <= -10) return 'Excellent';
        if (diff <= 0) return 'Good';
        if (diff <= 20) return 'Average';
        return 'Needs Improvement';
      } else {
        // Higher values are better for acceptance rate and salary
        if (diff >= 10) return 'Excellent';
        if (diff >= 0) return 'Good';
        if (diff >= -20) return 'Average';
        return 'Needs Improvement';
      }
    };

    return {
      responseTime: compare(company.avgResponseTime, benchmark.avgResponseTime, 'responseTime'),
      acceptanceRate: compare(company.avgAcceptanceRate, benchmark.avgAcceptanceRate, 'acceptanceRate'),
      salary: compare(company.avgSalary, benchmark.avgSalary, 'salary')
    };
  }

  /**
   * Get date range based on period
   */
  static getDateRange(period) {
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    return { startDate, endDate };
  }

  /**
   * Generate executive summary report
   */
  async generateExecutiveReport(companyId, dateRange = '30d') {
    try {
      const analytics = await this.getCompanyAnalytics(companyId, dateRange);
      
      if (!analytics.success) {
        throw new Error(analytics.error);
      }

      const { offers, performance, industryComparison } = analytics.data;
      
      // Key insights
      const insights = this.generateInsights(offers, performance, industryComparison);
      
      // Recommendations
      const recommendations = this.generateRecommendations(offers, performance, industryComparison);
      
      // Risk assessment
      const riskAssessment = this.assessRisks(offers, performance);

      return {
        success: true,
        data: {
          summary: {
            period: analytics.data.period,
            totalOffers: offers.summary.totalOffers,
            acceptanceRate: offers.acceptanceRate,
            avgResponseTime: offers.summary.avgResponseTime,
            totalValue: offers.summary.totalValue
          },
          insights,
          recommendations,
          riskAssessment,
          detailedAnalytics: analytics.data
        }
      };
    } catch (error) {
      console.error('Executive Report Error:', error);
      return {
        success: false,
        error: 'Failed to generate executive report',
        details: error.message
      };
    }
  }

  /**
   * Generate actionable insights
   */
  generateInsights(offers, performance, industryComparison) {
    const insights = [];

    // Offer insights
    if (offers.acceptanceRate < 50) {
      insights.push({
        type: 'warning',
        category: 'Acceptance Rate',
        message: 'Low acceptance rate detected. Consider reviewing offer terms and candidate experience.',
        impact: 'High',
        priority: 'High'
      });
    }

    if (offers.summary.avgResponseTime > 72) {
      insights.push({
        type: 'warning',
        category: 'Response Time',
        message: 'Slow response times may be affecting candidate experience and acceptance rates.',
        impact: 'Medium',
        priority: 'Medium'
      });
    }

    // Performance insights
    if (performance.efficiency.responseTimeEfficiency === 'Needs Improvement') {
      insights.push({
        type: 'info',
        category: 'Efficiency',
        message: 'Response time efficiency can be improved with process optimization.',
        impact: 'Medium',
        priority: 'Medium'
      });
    }

    // Industry comparison insights
    if (industryComparison.industry.comparison.responseTime === 'Excellent') {
      insights.push({
        type: 'success',
        category: 'Industry Performance',
        message: 'Response time performance is excellent compared to industry standards.',
        impact: 'Low',
        priority: 'Low'
      });
    }

    return insights;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(offers, performance, industryComparison) {
    const recommendations = [];

    // Acceptance rate recommendations
    if (offers.acceptanceRate < 50) {
      recommendations.push({
        category: 'Acceptance Rate',
        action: 'Review and optimize offer terms',
        description: 'Analyze rejected offers to identify common reasons and adjust terms accordingly.',
        expectedImpact: 'Increase acceptance rate by 15-20%',
        effort: 'Medium',
        timeline: '2-4 weeks'
      });
    }

    // Response time recommendations
    if (offers.summary.avgResponseTime > 72) {
      recommendations.push({
        category: 'Response Time',
        action: 'Implement automated response system',
        description: 'Set up automated acknowledgments and status updates to improve candidate experience.',
        expectedImpact: 'Reduce response time by 30-40%',
        effort: 'Low',
        timeline: '1-2 weeks'
      });
    }

    // Template optimization
    if (offers.summary.totalOffers > 10) {
      recommendations.push({
        category: 'Template Optimization',
        action: 'Analyze top-performing templates',
        description: 'Identify patterns in accepted offers and optimize templates accordingly.',
        expectedImpact: 'Improve template effectiveness',
        effort: 'Low',
        timeline: '1 week'
      });
    }

    return recommendations;
  }

  /**
   * Assess potential risks
   */
  assessRisks(offers, performance) {
    const risks = [];
    let overallRisk = 'Low';

    // High rejection rate risk
    if (offers.acceptanceRate < 30) {
      risks.push({
        level: 'High',
        category: 'Acceptance Rate',
        description: 'Very low acceptance rate indicates potential issues with offer terms or market positioning.',
        mitigation: 'Immediate review of offer structure and market research required.'
      });
      overallRisk = 'High';
    }

    // Slow response risk
    if (offers.summary.avgResponseTime > 120) {
      risks.push({
        level: 'Medium',
        category: 'Response Time',
        description: 'Slow response times may lead to candidate loss and damage to employer brand.',
        mitigation: 'Implement process improvements and automation.'
      });
      if (overallRisk !== 'High') overallRisk = 'Medium';
    }

    // Low offer volume risk
    if (offers.summary.totalOffers < 5) {
      risks.push({
        level: 'Low',
        category: 'Offer Volume',
        description: 'Low offer volume may indicate recruitment pipeline issues.',
        mitigation: 'Review recruitment strategy and pipeline management.'
      });
    }

    return {
      overallRisk,
      risks,
      lastUpdated: new Date()
    };
  }
}

module.exports = AnalyticsService;
