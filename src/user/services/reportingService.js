const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const GeneratedOffer = require('../model/generatedOffer');
const Template = require('../model/template');
const Company = require('../model/company');
const analyticsService = require('./analyticsService');

class ReportingService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../../../reports');
    this.ensureReportsDirectory();
  }

  /**
   * Ensure reports directory exists
   */
  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Generate comprehensive PDF report
   */
  async generatePDFReport(companyId, reportType = 'comprehensive', dateRange = '30d') {
    try {
      const filename = `report_${companyId}_${reportType}_${Date.now()}.pdf`;
      const filepath = path.join(this.reportsDir, filename);

      // Get analytics data
      const analytics = await analyticsService.getCompanyAnalytics(companyId, dateRange);
      if (!analytics.success) {
        throw new Error(analytics.error);
      }

      // Get company details
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Generate PDF based on report type
      let pdfContent;
      switch (reportType) {
        case 'executive':
          pdfContent = await this.generateExecutivePDF(company, analytics.data);
          break;
        case 'detailed':
          pdfContent = await this.generateDetailedPDF(company, analytics.data);
          break;
        case 'performance':
          pdfContent = await this.generatePerformancePDF(company, analytics.data);
          break;
        default:
          pdfContent = await this.generateComprehensivePDF(company, analytics.data);
      }

      // Write PDF to file
      fs.writeFileSync(filepath, pdfContent);

      return {
        success: true,
        data: {
          filename,
          filepath,
          size: fs.statSync(filepath).size,
          downloadUrl: `/api/user/reports/download/${filename}`
        }
      };
    } catch (error) {
      console.error('PDF Report Generation Error:', error);
      return {
        success: false,
        error: 'Failed to generate PDF report',
        details: error.message
      };
    }
  }

  /**
   * Generate comprehensive PDF report
   */
  async generateComprehensivePDF(company, analytics) {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      this.addHeader(doc, company);
      
      // Executive Summary
      this.addExecutiveSummary(doc, analytics);
      
      // Detailed Analytics
      this.addDetailedAnalytics(doc, analytics);
      
      // Charts and Visualizations
      this.addCharts(doc, analytics);
      
      // Recommendations
      this.addRecommendations(doc, analytics);
      
      // Footer
      this.addFooter(doc);

      doc.end();
    });
  }

  /**
   * Generate executive summary PDF
   */
  async generateExecutivePDF(company, analytics) {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      this.addHeader(doc, company);
      
      // Executive Summary
      this.addExecutiveSummary(doc, analytics);
      
      // Key Metrics
      this.addKeyMetrics(doc, analytics);
      
      // Insights and Recommendations
      this.addInsightsAndRecommendations(doc, analytics);
      
      // Footer
      this.addFooter(doc);

      doc.end();
    });
  }

  /**
   * Generate detailed analytics PDF
   */
  async generateDetailedPDF(company, analytics) {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      this.addHeader(doc, company);
      
      // Detailed Analytics
      this.addDetailedAnalytics(doc, analytics);
      
      // Template Performance
      this.addTemplatePerformance(doc, analytics);
      
      // Performance Metrics
      this.addPerformanceMetrics(doc, analytics);
      
      // Industry Comparison
      this.addIndustryComparison(doc, analytics);
      
      // Footer
      this.addFooter(doc);

      doc.end();
    });
  }

  /**
   * Generate performance-focused PDF
   */
  async generatePerformancePDF(company, analytics) {
    return new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      this.addHeader(doc, company);
      
      // Performance Overview
      this.addPerformanceOverview(doc, analytics);
      
      // Response Time Analysis
      this.addResponseTimeAnalysis(doc, analytics);
      
      // Conversion Funnel
      this.addConversionFunnel(doc, analytics);
      
      // Efficiency Metrics
      this.addEfficiencyMetrics(doc, analytics);
      
      // Footer
      this.addFooter(doc);

      doc.end();
    });
  }

  /**
   * Add header to PDF
   */
  addHeader(doc, company) {
    // Company logo placeholder
    doc.rect(50, 50, 60, 60)
       .stroke()
       .fontSize(12)
       .text('LOGO', 65, 75, { align: 'center' });

    // Company name and title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(company.profile.companyName, 130, 60)
       .fontSize(16)
       .font('Helvetica')
       .text('Offer Letter Analytics Report', 130, 90)
       .fontSize(12)
       .text(`Generated on: ${new Date().toLocaleDateString()}`, 130, 110);

    // Company details
    doc.fontSize(10)
       .text(`Industry: ${company.profile.industry}`, 130, 130)
       .text(`Type: ${company.profile.companyType}`, 130, 145)
       .text(`Location: ${company.profile.location.city}, ${company.profile.location.country}`, 130, 160);

    doc.moveDown(2);
  }

  /**
   * Add executive summary to PDF
   */
  addExecutiveSummary(doc, analytics) {
    doc.addPage();
    
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('Executive Summary', { align: 'center' })
       .moveDown();

    const { offers, performance } = analytics;
    
    // Key metrics table
    const tableData = [
      ['Metric', 'Value', 'Status'],
      ['Total Offers', offers.summary.totalOffers.toString(), this.getStatusColor(offers.summary.totalOffers > 0)],
      ['Acceptance Rate', `${offers.acceptanceRate}%`, this.getStatusColor(offers.acceptanceRate > 50)],
      ['Avg Response Time', `${offers.summary.avgResponseTime.toFixed(1)} hours`, this.getStatusColor(offers.summary.avgResponseTime < 72)],
      ['Total Value', `$${offers.summary.totalValue.toLocaleString()}`, this.getStatusColor(offers.summary.totalValue > 0)],
      ['Efficiency Rating', performance.efficiency.responseTimeEfficiency, this.getEfficiencyColor(performance.efficiency.responseTimeEfficiency)]
    ];

    this.addTable(doc, tableData);
    doc.moveDown();
  }

  /**
   * Add detailed analytics to PDF
   */
  addDetailedAnalytics(doc, analytics) {
    doc.addPage();
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Detailed Analytics')
       .moveDown();

    const { offers, templates } = analytics;

    // Offer trends
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Offer Trends')
       .moveDown();

    if (offers.dailyTrends.length > 0) {
      const trendData = [['Date', 'Offers', 'Value']];
      offers.dailyTrends.slice(0, 10).forEach(trend => {
        trendData.push([
          trend._id,
          trend.count.toString(),
          `$${trend.value.toLocaleString()}`
        ]);
      });
      this.addTable(doc, trendData);
    }

    doc.moveDown();

    // Template performance
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Top Performing Templates')
       .moveDown();

    if (templates.topTemplates.length > 0) {
      const templateData = [['Template', 'Usage', 'Acceptance Rate', 'Avg Salary']];
      templates.topTemplates.slice(0, 5).forEach(template => {
        templateData.push([
          template.name,
          template.usageCount.toString(),
          `${template.acceptanceRate.toFixed(1)}%`,
          `$${template.avgSalary.toLocaleString()}`
        ]);
      });
      this.addTable(doc, templateData);
    }
  }

  /**
   * Add charts to PDF
   */
  addCharts(doc, analytics) {
    doc.addPage();
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Charts and Visualizations')
       .moveDown();

    // Status distribution chart placeholder
    doc.fontSize(12)
       .text('Offer Status Distribution')
       .moveDown();

    const { statusDistribution } = analytics.offers;
    if (statusDistribution.length > 0) {
      const chartData = [['Status', 'Count', 'Percentage']];
      statusDistribution.forEach(status => {
        const percentage = ((status.count / analytics.offers.summary.totalOffers) * 100).toFixed(1);
        chartData.push([status._id, status.count.toString(), `${percentage}%`]);
      });
      this.addTable(doc, chartData);
    }

    doc.moveDown();

    // Performance trends
    doc.fontSize(12)
       .text('Performance Trends')
       .moveDown();

    // Add performance trend visualization
    this.addPerformanceChart(doc, analytics);
  }

  /**
   * Add recommendations to PDF
   */
  addRecommendations(doc, analytics) {
    doc.addPage();
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Insights and Recommendations')
       .moveDown();

    // Generate insights and recommendations
    const insights = analyticsService.generateInsights(analytics.offers, analytics.performance, analytics.industryComparison);
    const recommendations = analyticsService.generateRecommendations(analytics.offers, analytics.performance, analytics.industryComparison);

    // Insights
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Key Insights')
       .moveDown();

    insights.forEach((insight, index) => {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`${index + 1}. ${insight.category}`)
         .fontSize(10)
         .font('Helvetica')
         .text(insight.message)
         .moveDown(0.5);
    });

    doc.moveDown();

    // Recommendations
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Actionable Recommendations')
       .moveDown();

    recommendations.forEach((rec, index) => {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text(`${index + 1}. ${rec.action}`)
         .fontSize(10)
         .font('Helvetica')
         .text(rec.description)
         .text(`Expected Impact: ${rec.expectedImpact}`)
         .text(`Effort: ${rec.effort} | Timeline: ${rec.timeline}`)
         .moveDown(0.5);
    });
  }

  /**
   * Add footer to PDF
   */
  addFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(10)
         .text(
           `Page ${i + 1} of ${pageCount}`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
    }
  }

  /**
   * Add table to PDF
   */
  addTable(doc, data) {
    const startX = 50;
    const startY = doc.y;
    const colWidths = [150, 100, 100];
    const rowHeight = 25;

    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = startX + colWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0);
        const y = startY + (rowIndex * rowHeight);

        // Draw cell border
        doc.rect(x, y, colWidths[colIndex], rowHeight).stroke();

        // Add cell content
        doc.fontSize(10)
           .text(cell, x + 5, y + 8, {
             width: colWidths[colIndex] - 10,
             align: 'left'
           });
      });
    });

    doc.y = startY + (data.length * rowHeight) + 10;
  }

  /**
   * Add performance chart to PDF
   */
  addPerformanceChart(doc, analytics) {
    const { performance } = analytics;
    
    // Response time distribution
    const responseTimeData = [
      ['Response Time', 'Count'],
      ['Same Day (<24h)', performance.responseTime.responseTimeDistribution?.filter(r => r === 'same_day').length || 0],
      ['Within 3 Days', performance.responseTime.responseTimeDistribution?.filter(r => r === 'within_3_days').length || 0],
      ['More than 3 Days', performance.responseTime.responseTimeDistribution?.filter(r => r === 'more_than_3_days').length || 0]
    ];

    this.addTable(doc, responseTimeData);
  }

  /**
   * Get status color for metrics
   */
  getStatusColor(condition) {
    return condition ? '🟢 Good' : '🔴 Needs Attention';
  }

  /**
   * Get efficiency color
   */
  getEfficiencyColor(efficiency) {
    switch (efficiency) {
      case 'Excellent': return '🟢 Excellent';
      case 'Good': return '🟡 Good';
      case 'Average': return '🟠 Average';
      case 'Needs Improvement': return '🔴 Needs Improvement';
      default: return '⚪ N/A';
    }
  }

  /**
   * Generate Excel report
   */
  async generateExcelReport(companyId, reportType = 'comprehensive', dateRange = '30d') {
    try {
      const filename = `report_${companyId}_${reportType}_${Date.now()}.xlsx`;
      const filepath = path.join(this.reportsDir, filename);

      // Get analytics data
      const analytics = await analyticsService.getCompanyAnalytics(companyId, dateRange);
      if (!analytics.success) {
        throw new Error(analytics.error);
      }

      // Get company details
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Offer Letter System';
      workbook.lastModifiedBy = 'System';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Add worksheets based on report type
      switch (reportType) {
        case 'executive':
          await this.addExecutiveWorksheet(workbook, company, analytics.data);
          break;
        case 'detailed':
          await this.addDetailedWorksheet(workbook, company, analytics.data);
          break;
        case 'performance':
          await this.addPerformanceWorksheet(workbook, company, analytics.data);
          break;
        default:
          await this.addComprehensiveWorksheets(workbook, company, analytics.data);
      }

      // Write to file
      await workbook.xlsx.writeFile(filepath);

      return {
        success: true,
        data: {
          filename,
          filepath,
          size: fs.statSync(filepath).size,
          downloadUrl: `/api/user/reports/download/${filename}`
        }
      };
    } catch (error) {
      console.error('Excel Report Generation Error:', error);
      return {
        success: false,
        error: 'Failed to generate Excel report',
        details: error.message
      };
    }
  }

  /**
   * Add comprehensive worksheets to Excel
   */
  async addComprehensiveWorksheets(workbook, company, analytics) {
    // Executive Summary
    await this.addExecutiveWorksheet(workbook, company, analytics);
    
    // Detailed Analytics
    await this.addDetailedWorksheet(workbook, company, analytics);
    
    // Performance Metrics
    await this.addPerformanceWorksheet(workbook, company, analytics);
    
    // Template Performance
    await this.addTemplateWorksheet(workbook, company, analytics);
    
    // Industry Comparison
    await this.addIndustryWorksheet(workbook, company, analytics);
  }

  /**
   * Add executive summary worksheet
   */
  async addExecutiveWorksheet(workbook, company, analytics) {
    const worksheet = workbook.addWorksheet('Executive Summary');
    
    // Company information
    worksheet.addRow(['Company Name', company.profile.companyName]);
    worksheet.addRow(['Industry', company.profile.industry]);
    worksheet.addRow(['Company Type', company.profile.companyType]);
    worksheet.addRow(['Report Period', analytics.period.range]);
    worksheet.addRow(['Generated On', new Date().toLocaleDateString()]);
    worksheet.addRow([]);

    // Key metrics
    worksheet.addRow(['Key Metrics', 'Value', 'Status']);
    worksheet.addRow(['Total Offers', analytics.offers.summary.totalOffers, '']);
    worksheet.addRow(['Acceptance Rate', `${analytics.offers.acceptanceRate}%`, '']);
    worksheet.addRow(['Avg Response Time', `${analytics.offers.summary.avgResponseTime.toFixed(1)} hours`, '']);
    worksheet.addRow(['Total Value', `$${analytics.offers.summary.totalValue.toLocaleString()}`, '']);
    worksheet.addRow(['Efficiency Rating', analytics.performance.efficiency.responseTimeEfficiency, '']);

    // Style the worksheet
    this.styleWorksheet(worksheet);
  }

  /**
   * Add detailed analytics worksheet
   */
  async addDetailedWorksheet(workbook, company, analytics) {
    const worksheet = workbook.addWorksheet('Detailed Analytics');
    
    // Offer trends
    worksheet.addRow(['Daily Offer Trends']);
    worksheet.addRow(['Date', 'Offers', 'Value']);
    
    analytics.offers.dailyTrends.forEach(trend => {
      worksheet.addRow([trend._id, trend.count, trend.value]);
    });

    worksheet.addRow([]);

    // Status distribution
    worksheet.addRow(['Offer Status Distribution']);
    worksheet.addRow(['Status', 'Count', 'Percentage']);
    
    analytics.offers.statusDistribution.forEach(status => {
      const percentage = ((status.count / analytics.offers.summary.totalOffers) * 100).toFixed(1);
      worksheet.addRow([status._id, status.count, `${percentage}%`]);
    });

    this.styleWorksheet(worksheet);
  }

  /**
   * Add performance metrics worksheet
   */
  async addPerformanceWorksheet(workbook, company, analytics) {
    const worksheet = workbook.addWorksheet('Performance Metrics');
    
    // Response time analysis
    worksheet.addRow(['Response Time Analysis']);
    worksheet.addRow(['Metric', 'Value']);
    worksheet.addRow(['Average Response Time', `${analytics.performance.responseTime.avgResponseTime.toFixed(1)} hours`]);
    worksheet.addRow(['Minimum Response Time', `${analytics.performance.responseTime.minResponseTime.toFixed(1)} hours`]);
    worksheet.addRow(['Maximum Response Time', `${analytics.performance.responseTime.maxResponseTime.toFixed(1)} hours`]);
    worksheet.addRow(['Efficiency Rating', analytics.performance.efficiency.responseTimeEfficiency]);

    worksheet.addRow([]);

    // Time-based performance
    worksheet.addRow(['Time-based Performance']);
    worksheet.addRow(['Hour', 'Day of Week', 'Count', 'Avg Response Time']);
    
    analytics.performance.timePerformance.forEach(perf => {
      worksheet.addRow([perf._id.hour, perf._id.dayOfWeek, perf.count, perf.avgResponseTime.toFixed(1)]);
    });

    this.styleWorksheet(worksheet);
  }

  /**
   * Add template performance worksheet
   */
  async addTemplateWorksheet(workbook, company, analytics) {
    const worksheet = workbook.addWorksheet('Template Performance');
    
    worksheet.addRow(['Top Performing Templates']);
    worksheet.addRow(['Template Name', 'Industry', 'Company Type', 'Usage Count', 'Avg Salary', 'Acceptance Rate']);
    
    analytics.templates.topTemplates.forEach(template => {
      worksheet.addRow([
        template.name,
        template.industry,
        template.companyType,
        template.usageCount,
        template.avgSalary.toFixed(2),
        `${template.acceptanceRate.toFixed(1)}%`
      ]);
    });

    worksheet.addRow([]);

    // Category performance
    worksheet.addRow(['Category Performance']);
    worksheet.addRow(['Category', 'Total Usage', 'Avg Acceptance Rate']);
    
    analytics.templates.categoryPerformance.forEach(category => {
      worksheet.addRow([
        category._id,
        category.totalUsage,
        `${category.avgAcceptanceRate.toFixed(1)}%`
      ]);
    });

    this.styleWorksheet(worksheet);
  }

  /**
   * Add industry comparison worksheet
   */
  async addIndustryWorksheet(workbook, company, analytics) {
    const worksheet = workbook.addWorksheet('Industry Comparison');
    
    // Industry benchmarks
    worksheet.addRow(['Industry Benchmarks']);
    worksheet.addRow(['Metric', 'Industry Average', 'Company Performance', 'Comparison']);
    
    const industry = analytics.industryComparison.industry;
    worksheet.addRow(['Response Time', `${industry.benchmarks.avgResponseTime?.toFixed(1) || 'N/A'} hours`, 
                      `${industry.companyPerformance.avgResponseTime?.toFixed(1) || 'N/A'} hours`,
                      industry.comparison.responseTime || 'N/A']);
    
    worksheet.addRow(['Acceptance Rate', `${(industry.benchmarks.avgAcceptanceRate * 100)?.toFixed(1) || 'N/A'}%`,
                      `${(industry.companyPerformance.avgAcceptanceRate * 100)?.toFixed(1) || 'N/A'}%`,
                      industry.comparison.acceptanceRate || 'N/A']);

    worksheet.addRow([]);

    // Company type benchmarks
    worksheet.addRow(['Company Type Benchmarks']);
    worksheet.addRow(['Metric', 'Company Type Average', 'Company Performance', 'Comparison']);
    
    const companyType = analytics.industryComparison.companyType;
    worksheet.addRow(['Response Time', `${companyType.benchmarks.avgResponseTime?.toFixed(1) || 'N/A'} hours`,
                      `${companyType.companyPerformance.avgResponseTime?.toFixed(1) || 'N/A'} hours`,
                      companyType.comparison.responseTime || 'N/A']);

    this.styleWorksheet(worksheet);
  }

  /**
   * Style Excel worksheet
   */
  styleWorksheet(worksheet) {
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = Math.max(
        column.header ? column.header.length : 10,
        ...worksheet.getColumn(column.key).values.map(v => v ? v.toString().length : 0)
      ) + 2;
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  }

  /**
   * Clean up old reports
   */
  async cleanupOldReports(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    try {
      const files = fs.readdirSync(this.reportsDir);
      const now = Date.now();
      let deletedCount = 0;

      for (const file of files) {
        const filepath = path.join(this.reportsDir, file);
        const stats = fs.statSync(filepath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      }

      return {
        success: true,
        data: {
          deletedCount,
          message: `Cleaned up ${deletedCount} old report files`
        }
      };
    } catch (error) {
      console.error('Report Cleanup Error:', error);
      return {
        success: false,
        error: 'Failed to cleanup old reports',
        details: error.message
      };
    }
  }
}

module.exports = new ReportingService();
