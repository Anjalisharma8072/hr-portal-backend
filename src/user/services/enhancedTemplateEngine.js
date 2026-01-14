/**
 * Enhanced Template Engine for Universal Company Support
 * Generates offer letters for any company type, industry, and location
 */

const Template = require('../model/template');
const GeneratedOffer = require('../model/generatedOffer');
const salaryCalculator = require('./salaryCalculator');

class EnhancedTemplateEngine {
  constructor() {
    this.placeholderRegex = /\{\{([^}]+)\}\}/g;
  }

  /**
   * Generate offer letter for any company
   * @param {String} templateId - Template ID
   * @param {Object} candidateData - Candidate data
   * @param {String} userId - User ID
   * @param {Object} companyData - Company data
   * @returns {Object} Generated offer result
   */
  async generateUniversalOffer(templateId, candidateData, userId, companyData) {
    try {
      // Get template
      const template = await Template.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Validate template compatibility with company
      if (!template.isApplicableForCompany(companyData)) {
        throw new Error('Template is not compatible with this company type or industry');
      }

      // Calculate salary breakdown
      const salaryResult = salaryCalculator.calculateSalary(
        candidateData,
        companyData.offerLetterDefaults,
        companyData.location || 'India'
      );

      if (!salaryResult.success) {
        throw new Error(`Salary calculation failed: ${salaryResult.error}`);
      }

      // Render template with company branding
      const renderedResult = await this.renderTemplateWithBranding(
        template,
        candidateData,
        companyData,
        salaryResult.salaryBreakdown
      );

      // Create generated offer
      const generatedOffer = new GeneratedOffer({
        templateId: template._id,
        templateVersion: template.version,
        candidateData: candidateData,
        companyData: {
          companyId: companyData._id,
          companyName: companyData.organisationName,
          industry: companyData.companyInfo?.industry,
          companyType: companyData.companyInfo?.companyType,
          branding: companyData.branding,
          policies: companyData.policies
        },
        salaryBreakdown: salaryResult.salaryBreakdown,
        renderedContent: {
          html: renderedResult.html,
          plainText: renderedResult.plainText
        },
        metadata: {
          generatedBy: userId,
          organisation: companyData._id,
          industry: companyData.companyInfo?.industry,
          companyType: companyData.companyInfo?.companyType,
          location: companyData.location || 'India',
          currency: salaryResult.currency
        }
      });

      // Save generated offer
      await generatedOffer.save();

      // Generate PDF
      await generatedOffer.generatePDF();

      return {
        success: true,
        offer: generatedOffer,
        renderedContent: renderedResult,
        salaryBreakdown: salaryResult.salaryBreakdown
      };

    } catch (error) {
      console.error('Universal offer generation error:', error);
      throw error;
    }
  }

  /**
   * Render template with company branding
   * @param {Object} template - Template object
   * @param {Object} candidateData - Candidate data
   * @param {Object} companyData - Company data
   * @param {Object} salaryBreakdown - Salary breakdown
   * @returns {Object} Rendered result
   */
  async renderTemplateWithBranding(template, candidateData, companyData, salaryBreakdown) {
    try {
      let renderedHTML = '';
      let plainText = '';

      // Apply company branding
      const branding = this.applyCompanyBranding(template, companyData);
      
      // Generate global styles with company branding
      const globalStyles = this.generateBrandedStyles(template.content.globalStyling, companyData.branding);

      // Render each section with company context
      if (template.content && template.content.sections) {
        template.content.sections.forEach(section => {
          const sectionResult = this.renderSectionWithCompany(section, candidateData, companyData, salaryBreakdown);
          renderedHTML += sectionResult.html;
          plainText += sectionResult.plainText;
        });
      }

      // Wrap in branded document structure
      const finalHTML = this.wrapInBrandedDocument(renderedHTML, globalStyles, companyData);

      return {
        html: finalHTML,
        plainText: plainText.trim(),
        placeholders: this.parsePlaceholders(template),
        branding: branding
      };

    } catch (error) {
      console.error('Template rendering with branding error:', error);
      throw error;
    }
  }

  /**
   * Apply company branding to template
   * @param {Object} template - Template object
   * @param {Object} companyData - Company data
   * @returns {Object} Branding information
   */
  applyCompanyBranding(template, companyData) {
    const branding = {
      logo: companyData.branding?.logo || '',
      primaryColor: companyData.branding?.primaryColor || '#2563eb',
      secondaryColor: companyData.branding?.secondaryColor || '#64748b',
      fontFamily: companyData.branding?.fontFamily || 'Arial, sans-serif',
      companyName: companyData.organisationName
    };

    // Override with template-specific branding if enabled
    if (template.companyBranding?.useCompanyBranding !== false) {
      if (template.companyBranding?.customBranding?.logo) {
        branding.logo = template.companyBranding.customBranding.logo;
      }
      if (template.companyBranding?.customBranding?.primaryColor) {
        branding.primaryColor = template.companyBranding.customBranding.primaryColor;
      }
      if (template.companyBranding?.customBranding?.secondaryColor) {
        branding.secondaryColor = template.companyBranding.customBranding.secondaryColor;
      }
      if (template.companyBranding?.customBranding?.fontFamily) {
        branding.fontFamily = template.companyBranding.customBranding.fontFamily;
      }
    }

    return branding;
  }

  /**
   * Generate branded styles
   * @param {Object} globalStyling - Global styling
   * @param {Object} branding - Company branding
   * @returns {String} CSS styles
   */
  generateBrandedStyles(globalStyling, branding) {
    const styles = [];
    
    if (branding.fontFamily) styles.push(`font-family: ${branding.fontFamily}`);
    if (globalStyling?.fontSize) styles.push(`font-size: ${globalStyling.fontSize}`);
    if (globalStyling?.lineHeight) styles.push(`line-height: ${globalStyling.lineHeight}`);
    if (branding.primaryColor) styles.push(`color: ${branding.primaryColor}`);
    if (globalStyling?.backgroundColor) styles.push(`background-color: ${globalStyling.backgroundColor}`);
    
    return styles.join('; ');
  }

  /**
   * Render section with company context
   * @param {Object} section - Section object
   * @param {Object} candidateData - Candidate data
   * @param {Object} companyData - Company data
   * @param {Object} salaryBreakdown - Salary breakdown
   * @returns {Object} Rendered section
   */
  renderSectionWithCompany(section, candidateData, companyData, salaryBreakdown) {
    let html = '';
    let plainText = '';

    // Check company-specific conditions
    if (section.companyConditions && section.companyConditions.length > 0) {
      if (!this.evaluateCompanyConditions(section.companyConditions, companyData)) {
        return { html: '', plainText: '' };
      }
    }

    // Handle different section types
    switch (section.type) {
      case 'company_info':
        const companyResult = this.renderCompanyInfo(section, companyData);
        html += companyResult.html;
        plainText += companyResult.plainText;
        break;
        
      case 'benefits_table':
        const benefitsResult = this.renderBenefitsTable(section, companyData, salaryBreakdown);
        html += benefitsResult.html;
        plainText += benefitsResult.plainText;
        break;
        
      case 'terms_conditions':
        const termsResult = this.renderTermsConditions(section, companyData);
        html += termsResult.html;
        plainText += termsResult.plainText;
        break;
        
      case 'compliance_section':
        const complianceResult = this.renderComplianceSection(section, companyData);
        html += complianceResult.html;
        plainText += complianceResult.plainText;
        break;
        
      default:
        // Use existing rendering logic for standard sections
        const standardResult = this.renderStandardSection(section, candidateData, companyData);
        html += standardResult.html;
        plainText += standardResult.plainText;
    }

    return { html, plainText };
  }

  /**
   * Render company information section
   * @param {Object} section - Section object
   * @param {Object} companyData - Company data
   * @returns {Object} Rendered company info
   */
  renderCompanyInfo(section, companyData) {
    let html = '<div class="company-info" style="text-align: center; margin-bottom: 30px;">';
    
    if (companyData.branding?.logo) {
      html += `<img src="${companyData.branding.logo}" alt="${companyData.organisationName}" style="max-height: 80px; margin-bottom: 15px;">`;
    }
    
    html += `<h1 style="color: ${companyData.branding?.primaryColor || '#2563eb'}; margin-bottom: 10px;">${companyData.organisationName}</h1>`;
    
    if (companyData.companyInfo?.industry) {
      html += `<p style="color: ${companyData.branding?.secondaryColor || '#64748b'}; font-size: 14px;">${companyData.companyInfo.industry} Industry</p>`;
    }
    
    html += '</div>';
    
    const plainText = `${companyData.organisationName}\n${companyData.companyInfo?.industry || ''} Industry\n\n`;
    
    return { html, plainText };
  }

  /**
   * Render benefits table section
   * @param {Object} section - Section object
   * @param {Object} companyData - Company data
   * @param {Object} salaryBreakdown - Salary breakdown
   * @returns {Object} Rendered benefits table
   */
  renderBenefitsTable(section, companyData, salaryBreakdown) {
    let html = '<div class="benefits-table" style="margin: 20px 0;">';
    html += '<h3 style="color: #333; margin-bottom: 15px;">Benefits & Perks</h3>';
    html += '<table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">';
    html += '<thead><tr style="background-color: #f8f9fa;">';
    html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Benefit</th>';
    html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Type</th>';
    html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Value</th>';
    html += '</tr></thead><tbody>';
    
    let plainText = 'Benefits & Perks:\n';
    
    // Add company default benefits
    if (companyData.offerLetterDefaults?.defaultBenefits) {
      companyData.offerLetterDefaults.defaultBenefits.forEach(benefit => {
        html += '<tr>';
        html += `<td style="border: 1px solid #ddd; padding: 12px;">${benefit.name}</td>`;
        html += `<td style="border: 1px solid #ddd; padding: 12px;">${benefit.type}</td>`;
        html += `<td style="border: 1px solid #ddd; padding: 12px;">${benefit.value}</td>`;
        html += '</tr>';
        
        plainText += `- ${benefit.name}: ${benefit.value}\n`;
      });
    }
    
    // Add industry-specific benefits
    const industryBenefits = companyData.getIndustryBenefits?.() || [];
    industryBenefits.forEach(benefit => {
      html += '<tr>';
      html += `<td style="border: 1px solid #ddd; padding: 12px;">${benefit.name}</td>`;
      html += `<td style="border: 1px solid #ddd; padding: 12px;">${benefit.type}</td>`;
      html += `<td style="border: 1px solid #ddd; padding: 12px;">${benefit.value}</td>`;
      html += '</tr>';
      
      plainText += `- ${benefit.name}: ${benefit.value}\n`;
    });
    
    html += '</tbody></table></div>';
    
    return { html, plainText };
  }

  /**
   * Render terms and conditions section
   * @param {Object} section - Section object
   * @param {Object} companyData - Company data
   * @returns {Object} Rendered terms
   */
  renderTermsConditions(section, companyData) {
    let html = '<div class="terms-conditions" style="margin: 20px 0;">';
    html += '<h3 style="color: #333; margin-bottom: 15px;">Terms & Conditions</h3>';
    
    let plainText = 'Terms & Conditions:\n';
    
    const terms = companyData.offerLetterDefaults?.defaultTerms;
    if (terms) {
      html += '<ul style="margin: 0; padding-left: 20px;">';
      html += `<li>Probation Period: ${terms.probationPeriod} months</li>`;
      html += `<li>Notice Period: ${terms.noticePeriod} days</li>`;
      html += `<li>Contract Duration: ${terms.contractDuration} days</li>`;
      html += `<li>Working Hours: ${terms.workingHours}</li>`;
      html += `<li>Work Days: ${terms.workDays}</li>`;
      html += '</ul>';
      
      plainText += `- Probation Period: ${terms.probationPeriod} months\n`;
      plainText += `- Notice Period: ${terms.noticePeriod} days\n`;
      plainText += `- Contract Duration: ${terms.contractDuration} days\n`;
      plainText += `- Working Hours: ${terms.workingHours}\n`;
      plainText += `- Work Days: ${terms.workDays}\n`;
    }
    
    html += '</div>';
    
    return { html, plainText };
  }

  /**
   * Render compliance section
   * @param {Object} section - Section object
   * @param {Object} companyData - Company data
   * @returns {Object} Rendered compliance
   */
  renderComplianceSection(section, companyData) {
    let html = '<div class="compliance-section" style="margin: 20px 0;">';
    html += '<h3 style="color: #333; margin-bottom: 15px;">Compliance & Verification</h3>';
    
    let plainText = 'Compliance & Verification:\n';
    
    if (companyData.industryConfig?.compliance) {
      html += '<ul style="margin: 0; padding-left: 20px;">';
      companyData.industryConfig.compliance.forEach(item => {
        html += `<li>${item.name}: ${item.description}</li>`;
        plainText += `- ${item.name}: ${item.description}\n`;
      });
      html += '</ul>';
    }
    
    html += '</div>';
    
    return { html, plainText };
  }

  /**
   * Evaluate company-specific conditions
   * @param {Array} conditions - Company conditions
   * @param {Object} companyData - Company data
   * @returns {Boolean} Condition result
   */
  evaluateCompanyConditions(conditions, companyData) {
    return conditions.every(condition => {
      const value = this.getNestedValue(companyData, condition.field);
      const compareValue = condition.value;
      
      switch (condition.operator) {
        case '==': return value == compareValue;
        case '!=': return value != compareValue;
        case '>': return value > compareValue;
        case '>=': return value >= compareValue;
        case '<': return value < compareValue;
        case '<=': return value <= compareValue;
        case 'in': return Array.isArray(compareValue) && compareValue.includes(value);
        case 'not_in': return !Array.isArray(compareValue) || !compareValue.includes(value);
        default: return false;
      }
    });
  }

  /**
   * Get nested value from object
   * @param {Object} obj - Object to search
   * @param {String} path - Dot notation path
   * @returns {*} Value at path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Wrap rendered content in branded document
   * @param {String} content - Rendered content
   * @param {String} globalStyles - Global styles
   * @param {Object} companyData - Company data
   * @returns {String} Complete HTML document
   */
  wrapInBrandedDocument(content, globalStyles, companyData) {
    const branding = companyData.branding || {};
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyData.organisationName} - Offer Letter</title>
    <style>
        body { 
            ${globalStyles} 
            margin: 0; 
            padding: 20px; 
            font-family: ${branding.fontFamily || 'Arial, sans-serif'};
        }
        .company-info { margin-bottom: 30px; }
        .section-header { margin-bottom: 20px; }
        .section-paragraph { margin-bottom: 15px; }
        .section-table { margin: 20px 0; }
        .section-rich_text { margin-bottom: 15px; }
        .section-salary_table { margin: 20px 0; }
        .section-document_list { margin: 20px 0; }
        .section-company_info { margin-bottom: 20px; }
        .section-benefits_table { margin: 20px 0; }
        .section-terms_conditions { margin: 20px 0; }
        .section-compliance_section { margin: 20px 0; }
        
        .company-logo { max-height: 80px; margin-bottom: 15px; }
        .company-name { 
            color: ${branding.primaryColor || '#2563eb'}; 
            margin-bottom: 10px; 
            font-size: 24px;
            font-weight: bold;
        }
        .company-subtitle { 
            color: ${branding.secondaryColor || '#64748b'}; 
            font-size: 14px; 
        }
        
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
            @page { margin: 20mm; }
            .page-break { page-break-after: always; }
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
  }

  /**
   * Parse template placeholders
   * @param {Object} template - Template object
   * @returns {Array} Placeholders
   */
  parsePlaceholders(template) {
    const placeholders = new Set();
    
    if (template.content && template.content.sections) {
      template.content.sections.forEach(section => {
        this.extractPlaceholdersFromSection(section, placeholders);
      });
    }
    
    if (template.content && template.content.placeholders) {
      template.content.placeholders.forEach(placeholder => {
        placeholders.add(placeholder.key);
      });
    }
    
    return Array.from(placeholders);
  }

  /**
   * Extract placeholders from section
   * @param {Object} section - Section object
   * @param {Set} placeholders - Placeholders set
   */
  extractPlaceholdersFromSection(section, placeholders) {
    if (section.content && typeof section.content === 'string') {
      const matches = section.content.match(this.placeholderRegex);
      if (matches) {
        matches.forEach(match => placeholders.add(match));
      }
    }
    
    if (section.blocks) {
      section.blocks.forEach(block => {
        if (block.type === 'placeholder' && block.key) {
          placeholders.add(block.key);
        }
      });
    }
  }

  /**
   * Render standard section (fallback for existing logic)
   * @param {Object} section - Section object
   * @param {Object} candidateData - Candidate data
   * @param {Object} companyData - Company data
   * @returns {Object} Rendered section
   */
  renderStandardSection(section, candidateData, companyData) {
    // This would call your existing rendering logic
    // For now, return a simple placeholder
    return {
      html: `<div class="section-${section.type}">${section.content || ''}</div>`,
      plainText: section.content || ''
    };
  }
}

module.exports = new EnhancedTemplateEngine();
