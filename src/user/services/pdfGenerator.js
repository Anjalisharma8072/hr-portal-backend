const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

/**
 * PDF Generation Service
 * Generates professional PDFs with company branding and template styling
 */
class PDFGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../../uploads/pdfs');
    this.ensureOutputDir();
  }

  /**
   * Ensure output directory exists
   */
  async ensureOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch (error) {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate PDF from HTML content
   */
  async generatePDF(htmlContent, options = {}) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2
      });

      // Set content with enhanced styling
      await page.setContent(this.enhanceHTML(htmlContent, options), {
        waitUntil: 'networkidle0'
      });

      // Generate PDF with options
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        ...options
      });

      return pdfBuffer;

    } finally {
      await browser.close();
    }
  }

  /**
   * Generate offer letter PDF with company branding
   */
  async generateOfferLetterPDF(template, candidateData, companyData, salaryBreakdown, options = {}) {
    try {
      console.log('📄 [PDFGenerator] Generating offer letter PDF');

      // Generate HTML content
      const htmlContent = this.generateOfferLetterHTML(
        template,
        candidateData,
        companyData,
        salaryBreakdown,
        options
      );

      // Generate PDF
      const pdfBuffer = await this.generatePDF(htmlContent, {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm'
        }
      });

      // Save PDF to file
      const fileName = `offer-${candidateData.candidate_name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      const filePath = path.join(this.outputDir, fileName);
      await fs.writeFile(filePath, pdfBuffer);

      console.log('✅ [PDFGenerator] Offer letter PDF generated successfully:', filePath);

      return {
        buffer: pdfBuffer,
        filePath,
        fileName
      };

    } catch (error) {
      console.error('❌ [PDFGenerator] Error generating offer letter PDF:', error);
      throw error;
    }
  }

  /**
   * Generate offer letter HTML with company branding
   */
  generateOfferLetterHTML(template, candidateData, companyData, salaryBreakdown, options = {}) {
    const branding = companyData?.branding || {};
    const primaryColor = branding.primaryColor || '#2563eb';
    const secondaryColor = branding.secondaryColor || '#64748b';
    const fontFamily = branding.fontFamily || 'Arial, sans-serif';
    const logo = branding.logo || '';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offer Letter - ${candidateData.candidate_name}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: ${fontFamily}, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #ffffff;
          }
          
          .page {
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid ${primaryColor};
          }
          
          .company-logo {
            max-width: 150px;
            max-height: 80px;
            margin-bottom: 20px;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 10px;
          }
          
          .company-address {
            font-size: 14px;
            color: ${secondaryColor};
            line-height: 1.4;
          }
          
          .offer-title {
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            color: ${primaryColor};
            margin: 40px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .candidate-info {
            background-color: #f8fafc;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid ${primaryColor};
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .info-item {
            margin-bottom: 15px;
          }
          
          .info-label {
            font-weight: bold;
            color: ${primaryColor};
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 16px;
            color: #333;
          }
          
          .salary-section {
            background-color: #f1f5f9;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          
          .salary-title {
            font-size: 20px;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 20px;
            text-align: center;
          }
          
          .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .salary-table th,
          .salary-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .salary-table th {
            background-color: ${primaryColor};
            color: white;
            font-weight: bold;
          }
          
          .salary-table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          
          .total-row {
            font-weight: bold;
            background-color: ${primaryColor} !important;
            color: white !important;
          }
          
          .terms-section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 15px;
            border-bottom: 2px solid ${secondaryColor};
            padding-bottom: 5px;
          }
          
          .terms-list {
            list-style: none;
            padding-left: 0;
          }
          
          .terms-list li {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
          }
          
          .terms-list li:before {
            content: "•";
            color: ${primaryColor};
            font-weight: bold;
            position: absolute;
            left: 0;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
          }
          
          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
          }
          
          .signature-box {
            text-align: center;
          }
          
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            margin-bottom: 10px;
          }
          
          .signature-name {
            font-weight: bold;
            color: ${primaryColor};
          }
          
          .signature-title {
            font-size: 14px;
            color: ${secondaryColor};
          }
          
          .date-section {
            text-align: right;
            margin-top: 30px;
            font-size: 14px;
            color: ${secondaryColor};
          }
          
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(0, 0, 0, 0.03);
            pointer-events: none;
            z-index: -1;
          }
          
          @media print {
            .page {
              padding: 20px;
            }
            
            .watermark {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">OFFER LETTER</div>
        
        <div class="page">
          <!-- Header -->
          <div class="header">
            ${logo ? `<img src="${logo}" alt="Company Logo" class="company-logo">` : ''}
            <div class="company-name">${companyData?.companyName || 'Company Name'}</div>
            <div class="company-address">
              ${companyData?.location?.address || 'Company Address'}<br>
              ${companyData?.location?.city || 'City'}, ${companyData?.location?.state || 'State'} ${companyData?.location?.postalCode || 'PIN'}<br>
              ${companyData?.location?.country || 'Country'}
            </div>
          </div>
          
          <!-- Offer Title -->
          <div class="offer-title">Offer Letter</div>
          
          <!-- Candidate Information -->
          <div class="candidate-info">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Candidate Name</div>
                <div class="info-value">${candidateData.candidate_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${candidateData.candidate_email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Designation</div>
                <div class="info-value">${candidateData.designation}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Department</div>
                <div class="info-value">${candidateData.department}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Joining Date</div>
                <div class="info-value">${candidateData.joining_date || 'To be discussed'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Work Location</div>
                <div class="info-value">${candidateData.work_location || 'Company Office'}</div>
              </div>
            </div>
          </div>
          
          <!-- Salary Section -->
          ${salaryBreakdown ? `
          <div class="salary-section">
            <div class="salary-title">Compensation Details</div>
            <table class="salary-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Monthly (₹)</th>
                  <th>Annual (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td>${salaryBreakdown.basic?.monthly?.toLocaleString() || '0'}</td>
                  <td>${salaryBreakdown.basic?.annual?.toLocaleString() || '0'}</td>
                </tr>
                <tr>
                  <td>HRA</td>
                  <td>${salaryBreakdown.hra?.monthly?.toLocaleString() || '0'}</td>
                  <td>${salaryBreakdown.hra?.annual?.toLocaleString() || '0'}</td>
                </tr>
                <tr>
                  <td>Special Allowance</td>
                  <td>${salaryBreakdown.specialAllowance?.monthly?.toLocaleString() || '0'}</td>
                  <td>${salaryBreakdown.specialAllowance?.annual?.toLocaleString() || '0'}</td>
                </tr>
                <tr>
                  <td>Statutory Bonus</td>
                  <td>${salaryBreakdown.statutoryBonus?.monthly?.toLocaleString() || '0'}</td>
                  <td>${salaryBreakdown.statutoryBonus?.annual?.toLocaleString() || '0'}</td>
                </tr>
                <tr class="total-row">
                  <td>Gross Salary</td>
                  <td>${salaryBreakdown.grossSalary?.monthly?.toLocaleString() || '0'}</td>
                  <td>${salaryBreakdown.grossSalary?.annual?.toLocaleString() || '0'}</td>
                </tr>
                <tr>
                  <td>PF (Employee)</td>
                  <td>${salaryBreakdown.pf?.monthly?.toLocaleString() || '0'}</td>
                  <td>${salaryBreakdown.pf?.annual?.toLocaleString() || '0'}</td>
                </tr>
                <tr>
                  <td>ESIC (Employee)</td>
                  <td>${salaryBreakdown.esic?.monthly?.toLocaleString() || '0'}</td>
                  <td>${salaryBreakdown.esic?.annual?.toLocaleString() || '0'}</td>
                </tr>
                <tr>
                  <td>Net Take Home</td>
                  <td>${salaryBreakdown.netTakeHome?.monthly?.toLocaleString() || '0'}</td>
                  <td>${salaryBreakdown.netTakeHome?.annual?.toLocaleString() || '0'}</td>
                </tr>
                <tr class="total-row">
                  <td>Total CTC</td>
                  <td>${salaryBreakdown.ctc?.monthly?.toLocaleString() || '0'}</td>
                  <td>${salaryBreakdown.ctc?.annual?.toLocaleString() || '0'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <!-- Employment Terms -->
          <div class="terms-section">
            <div class="section-title">Employment Terms</div>
            <ul class="terms-list">
              <li><strong>Probation Period:</strong> ${companyData?.employmentTerms?.probationPeriod || 6} months</li>
              <li><strong>Notice Period:</strong> ${companyData?.employmentTerms?.noticePeriod || 30} days</li>
              <li><strong>Working Hours:</strong> ${companyData?.employmentTerms?.workingHours || '9 AM - 6 PM'}</li>
              <li><strong>Work Days:</strong> ${companyData?.employmentTerms?.workDays || 'Monday - Friday'}</li>
              <li><strong>Contract Duration:</strong> ${companyData?.employmentTerms?.contractDuration || 365} days</li>
            </ul>
          </div>
          
          <!-- Benefits -->
          ${companyData?.benefits && companyData.benefits.length > 0 ? `
          <div class="terms-section">
            <div class="section-title">Benefits & Perks</div>
            <ul class="terms-list">
              ${companyData.benefits.map(benefit => `
                <li><strong>${benefit.name}:</strong> ${benefit.value} ${benefit.isMandatory ? '(Mandatory)' : ''}</li>
              `).join('')}
            </ul>
          </div>
          ` : ''}
          
          <!-- Date -->
          <div class="date-section">
            Date: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          
          <!-- Signatures -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-name">HR Manager</div>
              <div class="signature-title">Human Resources</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-name">${candidateData.candidate_name}</div>
              <div class="signature-title">Candidate</div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p>This offer letter is valid for 30 days from the date of issue.</p>
            <p>For any queries, please contact HR department.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Enhance HTML with additional styling and branding
   */
  enhanceHTML(htmlContent, options = {}) {
    const { companyBranding, customCSS } = options;
    
    if (!companyBranding && !customCSS) {
      return htmlContent;
    }

    let enhancedHTML = htmlContent;

    // Add custom CSS if provided
    if (customCSS) {
      enhancedHTML = enhancedHTML.replace('</style>', `${customCSS}\n</style>`);
    }

    // Add company branding CSS
    if (companyBranding) {
      const brandingCSS = `
        .company-header {
          background: linear-gradient(135deg, ${companyBranding.primaryColor || '#2563eb'}, ${companyBranding.secondaryColor || '#64748b'});
          color: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .company-logo {
          filter: brightness(0) invert(1);
        }
        
        .primary-color {
          color: ${companyBranding.primaryColor || '#2563eb'} !important;
        }
        
        .secondary-color {
          color: ${companyBranding.secondaryColor || '#64748b'} !important;
        }
        
        .brand-border {
          border-color: ${companyBranding.primaryColor || '#2563eb'} !important;
        }
      `;

      enhancedHTML = enhancedHTML.replace('</style>', `${brandingCSS}\n</style>`);
    }

    return enhancedHTML;
  }

  /**
   * Generate bulk PDFs for multiple offers
   */
  async generateBulkPDFs(offers, options = {}) {
    try {
      console.log('📚 [PDFGenerator] Generating bulk PDFs for', offers.length, 'offers');

      const results = [];
      const errors = [];

      for (const offer of offers) {
        try {
          const result = await this.generateOfferLetterPDF(
            offer.template,
            offer.candidateData,
            offer.companyData,
            offer.salaryBreakdown,
            options
          );

          results.push({
            offerId: offer.id,
            candidateName: offer.candidateData.candidate_name,
            pdfPath: result.filePath,
            fileName: result.fileName
          });

        } catch (error) {
          errors.push({
            offerId: offer.id,
            candidateName: offer.candidateData.candidate_name,
            error: error.message
          });
        }
      }

      console.log('✅ [PDFGenerator] Bulk PDF generation completed:', {
        successful: results.length,
        errors: errors.length
      });

      return { results, errors };

    } catch (error) {
      console.error('❌ [PDFGenerator] Error in bulk PDF generation:', error);
      throw error;
    }
  }

  /**
   * Clean up old PDF files
   */
  async cleanupOldPDFs(maxAgeDays = 30) {
    try {
      const files = await fs.readdir(this.outputDir);
      const now = Date.now();
      const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (file.endsWith('.pdf')) {
          const filePath = path.join(this.outputDir, file);
          const stats = await fs.stat(filePath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            await fs.unlink(filePath);
            console.log('🗑️ [PDFGenerator] Cleaned up old PDF:', file);
          }
        }
      }

    } catch (error) {
      console.error('❌ [PDFGenerator] Error cleaning up old PDFs:', error);
    }
  }
}

module.exports = new PDFGenerator();
