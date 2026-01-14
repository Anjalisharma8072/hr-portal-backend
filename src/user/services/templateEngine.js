const Template = require('../model/template');
const GeneratedOffer = require('../model/generatedOffer');

class TemplateEngine {
  constructor() {
    this.placeholderRegex = /\{\{([^}]+)\}\}/g;
  }

  /**
   * Parse template and extract all placeholders
   * @param {Object} template - Template object
   * @returns {Array} Array of placeholder objects
   */
  parsePlaceholders(template) {
    const placeholders = new Set();
    
    // Extract placeholders from sections
    if (template.content && template.content.sections) {
      template.content.sections.forEach(section => {
        this.extractPlaceholdersFromSection(section, placeholders);
      });
    }
    
    // Extract placeholders from global placeholders
    if (template.content && template.content.placeholders) {
      template.content.placeholders.forEach(placeholder => {
        placeholders.add(placeholder.key);
      });
    }
    
    return Array.from(placeholders);
  }

  /**
   * Extract placeholders from a specific section
   * @param {Object} section - Section object
   * @param {Set} placeholders - Set to store placeholders
   */
  extractPlaceholdersFromSection(section, placeholders) {
    // Handle different section types
    switch (section.type) {
      case 'rich_text':
        if (section.blocks) {
          section.blocks.forEach(block => {
            if (block.type === 'placeholder' && block.key) {
              placeholders.add(block.key);
            }
          });
        }
        break;
        
      case 'paragraph':
        if (section.content) {
          const matches = section.content.match(this.placeholderRegex);
          if (matches) {
            matches.forEach(match => placeholders.add(match));
          }
        }
        break;
        
      case 'table':
        if (section.content && section.content.rows) {
          section.content.rows.forEach(row => {
            row.forEach(cell => {
              if (typeof cell === 'string') {
                const matches = cell.match(this.placeholderRegex);
                if (matches) {
                  matches.forEach(match => placeholders.add(match));
                }
              }
            });
          });
        }
        break;
        
      case 'list':
        if (section.content && section.content.items) {
          section.content.items.forEach(item => {
            if (typeof item === 'string') {
              const matches = item.match(this.placeholderRegex);
              if (matches) {
                matches.forEach(match => placeholders.add(match));
              }
            }
          });
        }
        break;
    }
  }

  /**
   * Validate template content
   * @param {Object} template - Template object
   * @returns {Object} Validation result
   */
  validateTemplate(template) {
    const errors = [];
    const warnings = [];
    
    // Check required sections
    if (template.content && template.content.sections) {
      template.content.sections.forEach(section => {
        if (section.metadata && section.metadata.isRequired) {
          if (!section.content && (!section.blocks || section.blocks.length === 0)) {
            errors.push(`Required section '${section.id}' has no content`);
          }
        }
      });
    }
    
    // Check required placeholders
    if (template.content && template.content.placeholders) {
      template.content.placeholders.forEach(placeholder => {
        if (placeholder.required && !placeholder.defaultValue) {
          warnings.push(`Required placeholder '${placeholder.key}' has no default value`);
        }
      });
    }
    
    // Check for orphaned placeholders
    const definedPlaceholders = new Set();
    if (template.content && template.content.placeholders) {
      template.content.placeholders.forEach(p => definedPlaceholders.add(p.key));
    }
    
    const usedPlaceholders = this.parsePlaceholders(template);
    usedPlaceholders.forEach(placeholder => {
      if (!definedPlaceholders.has(placeholder)) {
        warnings.push(`Placeholder '${placeholder}' is used but not defined`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Render template with candidate data
   * @param {Object} template - Template object
   * @param {Object} candidateData - Candidate data object
   * @returns {Object} Rendered template result
   */
  async renderTemplate(template, candidateData) {
    try {
      // Validate template first
      const validation = this.validateTemplate(template);
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }
      
      let renderedHTML = '';
      let plainText = '';
      
      // Process global styling
      const globalStyles = this.generateGlobalStyles(template.content.globalStyling);
      
      // Render each section
      if (template.content && template.content.sections) {
        template.content.sections.forEach(section => {
          const sectionResult = this.renderSection(section, candidateData);
          renderedHTML += sectionResult.html;
          plainText += sectionResult.plainText;
        });
      }
      
      // Wrap in document structure
      const finalHTML = this.wrapInDocument(renderedHTML, globalStyles);
      
      return {
        html: finalHTML,
        plainText: plainText.trim(),
        placeholders: this.parsePlaceholders(template),
        validation
      };
      
    } catch (error) {
      console.error('Template rendering error:', error);
      throw error;
    }
  }

  /**
   * Render individual section
   * @param {Object} section - Section object
   * @param {Object} candidateData - Candidate data
   * @returns {Object} Rendered section
   */
  renderSection(section, candidateData) {
    let html = '';
    let plainText = '';
    
    // Handle conditional section
    if (section.type === 'conditional') {
      if (this.evaluateCondition(section.condition, candidateData)) {
        // Render inner content if condition is true
        if (section.content) {
          const innerResult = this.renderParagraph({ ...section, type: 'paragraph' }, candidateData);
          html += innerResult.html;
          plainText += innerResult.plainText;
        }
        return { html, plainText };
      } else {
        return { html: '', plainText: '' };
      }
    }
    
    // Generate section wrapper
    const sectionStyles = this.generateSectionStyles(section.styling);
    html += `<div class="section-${section.type}" style="${sectionStyles}">`;
    
    // Render section content based on type
    switch (section.type) {
      case 'header':
        const headerResult = this.renderHeader(section, candidateData);
        html += headerResult.html;
        plainText += headerResult.plainText;
        break;
        
      case 'paragraph':
        const paragraphResult = this.renderParagraph(section, candidateData);
        html += paragraphResult.html;
        plainText += paragraphResult.plainText;
        break;
        
      case 'rich_text':
        const richTextResult = this.renderRichText(section, candidateData);
        html += richTextResult.html;
        plainText += richTextResult.plainText;
        break;
        
      case 'table':
        const tableResult = this.renderTable(section, candidateData);
        html += tableResult.html;
        plainText += tableResult.plainText;
        break;
        
      case 'list':
        const listResult = this.renderList(section, candidateData);
        html += listResult.html;
        plainText += listResult.plainText;
        break;
        
      case 'salary_table':
        const salaryResult = this.renderSalaryTable(section, candidateData);
        html += salaryResult.html;
        plainText += salaryResult.plainText;
        break;
        
      case 'document_list':
        const documentResult = this.renderDocumentList(section, candidateData);
        html += documentResult.html;
        plainText += documentResult.plainText;
        break;
        
      default:
        html += `<p>Unsupported section type: ${section.type}</p>`;
        plainText += `[${section.type} section]\n`;
    }
    
    html += '</div>';
    
    return { html, plainText };
  }

  /**
   * Evaluate condition for conditional sections
   * @param {Object} condition - Condition object
   * @param {Object} data - Candidate data
   * @returns {Boolean} Condition result
   */
  evaluateCondition(condition, data) {
    if (!condition) return true;
    
    const value = this.getNestedValue(data, condition.field);
    const compareValue = condition.value;
    
    switch (condition.operator) {
      case '==':
        return value == compareValue;
      case '!=':
        return value != compareValue;
      case '>':
        return value > compareValue;
      case '>=':
        return value >= compareValue;
      case '<':
        return value < compareValue;
      case '<=':
        return value <= compareValue;
      case 'in':
        return Array.isArray(compareValue) && compareValue.includes(value);
      case 'not_in':
        return !Array.isArray(compareValue) || !compareValue.includes(value);
      default:
        return false;
    }
  }

  /**
   * Render header section
   * @param {Object} section - Header section
   * @param {Object} candidateData - Candidate data
   * @returns {Object} Rendered header
   */
  renderHeader(section, candidateData) {
    let content = section.content || section.title || '';
    
    // Replace placeholders
    content = this.replacePlaceholders(content, candidateData);
    
    // Apply formatting
    const formatting = this.generateTextFormatting(section.formatting);
    
    const html = `<h${section.metadata?.order || 1} style="${formatting}">${content}</h${section.metadata?.order || 1}>`;
    const plainText = `${content}\n`;
    
    return { html, plainText };
  }

  /**
   * Render paragraph section
   * @param {Object} section - Paragraph section
   * @param {Object} candidateData - Candidate data
   * @returns {Object} Rendered paragraph
   */
  renderParagraph(section, candidateData) {
    let content = section.content || '';
    
    // Replace placeholders
    content = this.replacePlaceholders(content, candidateData);
    
    // Apply formatting
    const formatting = this.generateTextFormatting(section.formatting);
    
    const html = `<p style="${formatting}">${content}</p>`;
    const plainText = `${content}\n\n`;
    
    return { html, plainText };
  }

  /**
   * Render rich text section
   * @param {Object} section - Rich text section
   * @param {Object} candidateData - Candidate data
   * @returns {Object} Rendered rich text
   */
  renderRichText(section, candidateData) {
    let html = '';
    let plainText = '';
    
    if (section.blocks && Array.isArray(section.blocks)) {
      section.blocks.forEach(block => {
        const blockResult = this.renderBlock(block, candidateData);
        html += blockResult.html;
        plainText += blockResult.plainText;
      });
    }
    
    return { html, plainText };
  }

  /**
   * Render individual block
   * @param {Object} block - Content block
   * @param {Object} candidateData - Candidate data
   * @returns {Object} Rendered block
   */
  renderBlock(block, candidateData) {
    let content = '';
    let html = '';
    let plainText = '';
    
    switch (block.type) {
      case 'text':
        content = block.text || '';
        break;
        
      case 'placeholder':
        content = candidateData[block.key] || block.key;
        break;
        
      case 'break':
        html = '<br>';
        plainText = '\n';
        return { html, plainText };
        
      default:
        content = block.text || block.key || '';
    }
    
    // Apply formatting
    if (block.formatting) {
      html = this.applyFormatting(content, block.formatting);
    } else {
      html = content;
    }
    
    plainText = content;
    
    return { html, plainText };
  }

  /**
   * Apply formatting to text
   * @param {String} text - Text to format
   * @param {Object} formatting - Formatting object
   * @returns {String} Formatted HTML
   */
  applyFormatting(text, formatting) {
    let html = text;
    
    // Apply text formatting
    if (formatting.fontWeight === 'bold') {
      html = `<strong>${html}</strong>`;
    }
    
    if (formatting.fontStyle === 'italic') {
      html = `<em>${html}</em>`;
    }
    
    if (formatting.textDecoration === 'underline') {
      html = `<u>${html}</u>`;
    }
    
    // Apply inline styles
    const inlineStyles = [];
    
    if (formatting.color) {
      inlineStyles.push(`color: ${formatting.color}`);
    }
    
    if (formatting.backgroundColor) {
      inlineStyles.push(`background-color: ${formatting.backgroundColor}`);
    }
    
    if (formatting.fontSize) {
      inlineStyles.push(`font-size: ${formatting.fontSize}`);
    }
    
    if (formatting.textAlign) {
      inlineStyles.push(`text-align: ${formatting.textAlign}`);
    }
    
    if (inlineStyles.length > 0) {
      html = `<span style="${inlineStyles.join('; ')}">${html}</span>`;
    }
    
    return html;
  }

  /**
   * Render table section
   * @param {Object} section - Table section
   * @param {Object} candidateData - Candidate data
   * @returns {Object} Rendered table
   */
  renderTable(section, candidateData) {
    if (!section.content || !section.content.headers) {
      return { html: '<p>Invalid table structure</p>', plainText: '[Table]\n' };
    }
    
    let html = '<table style="border-collapse: collapse; width: 100%; margin: 20px 0;">';
    let plainText = '';
    
    // Render headers
    html += '<thead><tr>';
    section.content.headers.forEach(header => {
      const headerText = this.replacePlaceholders(header, candidateData);
      html += `<th style="border: 1px solid #ddd; padding: 12px; text-align: left; background-color: #f2f2f2;">${headerText}</th>`;
      plainText += `${headerText}\t`;
    });
    html += '</tr></thead>';
    plainText += '\n';
    
    // Render rows
    html += '<tbody>';
    if (section.content.rows) {
      section.content.rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
          const cellText = this.replacePlaceholders(cell, candidateData);
          html += `<td style="border: 1px solid #ddd; padding: 12px;">${cellText}</td>`;
          plainText += `${cellText}\t`;
        });
        html += '</tr>';
        plainText += '\n';
      });
    }
    html += '</tbody>';
    
    html += '</table>';
    
    return { html, plainText };
  }

  /**
   * Render salary table section
   * @param {Object} section - Salary table section
   * @param {Object} candidateData - Candidate data
   * @returns {Object} Rendered salary table
   */
  renderSalaryTable(section, candidateData) {
    const salaryData = {
      basic: {
        annual: candidateData.base_salary || 450000,
        monthly: (candidateData.base_salary || 450000) / 12
      },
      hra: {
        annual: candidateData.hra || 180000,
        monthly: (candidateData.hra || 180000) / 12
      },
      education: {
        annual: 2400,
        monthly: 200
      },
      personal: {
        annual: 137700,
        monthly: 11475
      },
      monthlyGross: {
        annual: 770100,
        monthly: 64175
      },
      lunch: {
        annual: 26400,
        monthly: 2200
      },
      pf: {
        annual: 54000,
        monthly: 4500
      },
      fixedTotal: {
        annual: 850500,
        monthly: 70875
      },
      telephone: {
        annual: 12000,
        monthly: 1000
      },
      lta: {
        annual: 37500,
        monthly: 3125
      },
      claimableTotal: {
        annual: 49500,
        monthly: 4125
      },
      totalFixed: {
        annual: candidateData.total_fixed || 900000,
        monthly: (candidateData.total_fixed || 900000) / 12
      },
      wellbeing: {
        annual: 23355,
        monthly: 0
      },
      gratuity: {
        annual: 21645,
        monthly: 0
      },
      performance: 'Basis performance',
      indicativeCtc: {
        annual: candidateData.total_ctc || 945000,
        monthly: 0
      }
    };
    
    let html = '<div class="salary-table" style="margin: 20px 0;">';
    html += '<table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">';
    html += '<thead><tr style="background-color: #f8f9fa;">';
    html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Fixed Remuneration</th>';
    html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Annual</th>';
    html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Monthly</th>';
    html += '</tr></thead>';
    
    html += '<tbody>';
    
    // Basic
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">Basic</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.basic.annual.toLocaleString()}</td>`;
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.basic.monthly.toLocaleString()}</td></tr>`;
    
    // HRA
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">House Rent Allowance</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.hra.annual.toLocaleString()}</td>`;
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.hra.monthly.toLocaleString()}</td></tr>`;
    
    // Education
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">Education Allowance</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.education.annual.toLocaleString()}</td>`;
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.education.monthly.toLocaleString()}</td></tr>`;
    
    // Personal
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">Personal Allowance</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.personal.annual.toLocaleString()}</td>`;
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.personal.monthly.toLocaleString()}</td></tr>`;
    
    // Monthly Gross
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">Monthly Gross</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.monthlyGross.annual.toLocaleString()}</td>`;
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.monthlyGross.monthly.toLocaleString()}</td></tr>`;
    
    // Lunch
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">Lunch Allowance</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.lunch.annual.toLocaleString()}</td>`;
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.lunch.monthly.toLocaleString()}</td></tr>`;
    
    // PF
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">Organization\'s Contribution to PF</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.pf.annual.toLocaleString()}</td>`;
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.pf.monthly.toLocaleString()}</td></tr>`;
    
    // Total Fixed
    html += '<tr style="font-weight: bold;"><td style="border: 1px solid #ddd; padding: 12px;">Total</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.fixedTotal.annual.toLocaleString()}</td>`;
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.fixedTotal.monthly.toLocaleString()}</td></tr>`;
    
    html += '</tbody></table>';
    
    // Claimable Components Table
    html += '<table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; margin-top: 20px;">';
    html += '<thead><tr style="background-color: #f8f9fa;">';
    html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Claimable Components</th>';
    html += '<th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Annual Amount To be Claimed</th>';
    html += '</tr></thead>';
    
    html += '<tbody>';
    
    // Telephone
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">Reimbursement of Telephone Expenses</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.telephone.annual.toLocaleString()}</td></tr>`;
    
    // LTA
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">Leave Travel Allowance</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.lta.annual.toLocaleString()}</td></tr>`;
    
    // Total Claimable
    html += '<tr style="font-weight: bold;"><td style="border: 1px solid #ddd; padding: 12px;">Total Claimable</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.claimableTotal.annual.toLocaleString()}</td></tr>`;
    
    html += '</tbody></table>';
    
    // Total Fixed Remuneration
    html += '<table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd; margin-top: 20px;">';
    html += '<tbody>';
    html += '<tr style="font-weight: bold;"><td style="border: 1px solid #ddd; padding: 12px;">Total Fixed Remuneration [A]</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.totalFixed.annual.toLocaleString()}</td>`;
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.totalFixed.monthly.toLocaleString()}</td></tr>`;
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">Organisation’s contribution towards wellbeing [B]</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.wellbeing.annual.toLocaleString()}</td>`;
    html += '<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">-</td></tr>';
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">Gratuity [C]</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.gratuity.annual.toLocaleString()}</td>`;
    html += '<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">-</td></tr>';
    html += '<tr><td style="border: 1px solid #ddd; padding: 12px;">Performance Incentive [D] (indicative)</td>';
    html += '<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${salaryData.performance}</td>';
    html += '<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">-</td></tr>';
    html += '<tr style="font-weight: bold; background-color: #e8f5e8;"><td style="border: 1px solid #ddd; padding: 12px;">Indicative Cost to Company ([A]+[B]+[C])(excluding Performance Incentive)</td>';
    html += `<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${salaryData.indicativeCtc.annual.toLocaleString()}</td>`;
    html += '<td style="border: 1px solid #ddd; padding: 12px; text-align: right;">-</td></tr>';
    html += '</tbody></table></div>';
    
    const plainText = `Fixed Remuneration:\nBasic: ₹${salaryData.basic.annual} annual\n... (full details)\n`;
    
    return { html, plainText };
  }

  /**
   * Render list section
   * @param {Object} section - List section
   * @param {Object} candidateData - Candidate data
   * @returns {Object} Rendered list
   */
  renderList(section, candidateData) {
    let html = '<ul style="margin: 20px 0; padding-left: 20px;">';
    let plainText = '';
    if (section.content && section.content.items) {
      section.content.items.forEach(item => {
        const itemText = this.replacePlaceholders(item, candidateData);
        html += `<li>${itemText}</li>`;
        plainText += `- ${itemText}\n`;
      });
    }
    html += '</ul>';
    return { html, plainText };
  }

  /**
   * Render document list section
   * @param {Object} section - Document list section
   * @param {Object} candidateData - Candidate data
   * @returns {Object} Rendered document list
   */
  renderDocumentList(section, candidateData) {
    let html = '<ol style="margin: 20px 0; padding-left: 20px;">';
    let plainText = '';
    if (section.content && section.content.items) {
      section.content.items.forEach((item, index) => {
        const itemText = this.replacePlaceholders(item, candidateData);
        html += `<li>${itemText}</li>`;
        plainText += `${index + 1}. ${itemText}\n`;
      });
    }
    html += '</ol>';
    return { html, plainText };
  }

  /**
   * Replace placeholders in text
   * @param {String} text - Text with placeholders
   * @param {Object} candidateData - Candidate data
   * @returns {String} Text with replaced placeholders
   */
  replacePlaceholders(text, candidateData) {
    if (typeof text !== 'string') return text;
    
    return text.replace(this.placeholderRegex, (match, key) => {
      // Handle nested properties (e.g., candidate.name)
      const value = this.getNestedValue(candidateData, key);
      return value !== undefined ? value : match;
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
   * Generate global styles
   * @param {Object} globalStyling - Global styling object
   * @returns {String} CSS styles
   */
  generateGlobalStyles(globalStyling) {
    if (!globalStyling) return '';
    
    const styles = [];
    
    if (globalStyling.fontFamily) styles.push(`font-family: ${globalStyling.fontFamily}`);
    if (globalStyling.fontSize) styles.push(`font-size: ${globalStyling.fontSize}`);
    if (globalStyling.lineHeight) styles.push(`line-height: ${globalStyling.lineHeight}`);
    if (globalStyling.color) styles.push(`color: ${globalStyling.color}`);
    if (globalStyling.backgroundColor) styles.push(`background-color: ${globalStyling.backgroundColor}`);
    
    return styles.join('; ');
  }

  /**
   * Generate section styles
   * @param {Object} styling - Section styling object
   * @returns {String} CSS styles
   */
  generateSectionStyles(styling) {
    if (!styling) return '';
    
    const styles = [];
    
    if (styling.fontSize) styles.push(`font-size: ${styling.fontSize}`);
    if (styling.lineHeight) styles.push(`line-height: ${styling.lineHeight}`);
    if (styling.marginTop) styles.push(`margin-top: ${styling.marginTop}`);
    if (styling.marginBottom) styles.push(`margin-bottom: ${styling.marginBottom}`);
    if (styling.padding) styles.push(`padding: ${styling.padding}`);
    if (styling.backgroundColor) styles.push(`background-color: ${styling.backgroundColor}`);
    if (styling.border) styles.push(`border: ${styling.border}`);
    if (styling.borderRadius) styles.push(`border-radius: ${styling.borderRadius}`);
    
    return styles.join('; ');
  }

  /**
   * Generate text formatting styles
   * @param {Object} formatting - Text formatting object
   * @returns {String} CSS styles
   */
  generateTextFormatting(formatting) {
    if (!formatting) return '';
    
    const styles = [];
    
    if (formatting.fontWeight) styles.push(`font-weight: ${formatting.fontWeight}`);
    if (formatting.fontSize) styles.push(`font-size: ${formatting.fontSize}`);
    if (formatting.color) styles.push(`color: ${formatting.color}`);
    if (formatting.textAlign) styles.push(`text-align: ${formatting.textAlign}`);
    if (formatting.textDecoration) styles.push(`text-decoration: ${formatting.textDecoration}`);
    if (formatting.fontStyle) styles.push(`font-style: ${formatting.fontStyle}`);
    
    return styles.join('; ');
  }

  /**
   * Wrap rendered content in document structure
   * @param {String} content - Rendered content
   * @param {String} globalStyles - Global styles
   * @returns {String} Complete HTML document
   */
  wrapInDocument(content, globalStyles) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offer Letter</title>
    <style>
        body { ${globalStyles} margin: 0; padding: 20px; }
        .section-header { margin-bottom: 20px; }
        .section-paragraph { margin-bottom: 15px; }
        .section-table { margin: 20px 0; }
        .section-rich_text { margin-bottom: 15px; }
        .section-salary_table { margin: 20px 0; }
        .section-document_list { margin: 20px 0; }
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
   * Generate offer from template
   * @param {String} templateId - Template ID
   * @param {Object} candidateData - Candidate data
   * @param {String} userId - User ID generating the offer
   * @returns {Object} Generated offer
   */
  async generateOffer(templateId, candidateData, userId, companyData = null) {
    try {
      // Get template
      const template = await Template.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }
      
      // Render template
      const renderedResult = await this.renderTemplate(template, candidateData);
      
      // Create generated offer
      const generatedOffer = new GeneratedOffer({
        templateId: template._id,
        templateVersion: template.version,
        candidateData: candidateData,
        companyData: companyData ? {
          companyId: companyData._id,
          companyName: companyData.companyName,
          industry: companyData.industry,
          companyType: companyData.companyType,
          branding: companyData.branding,
          policies: companyData.policies
        } : {
          companyId: template.metadata.organisation, // Use organisation as fallback
          companyName: 'Standard Company', // Default company name
          industry: 'General',
          companyType: 'corporate'
        },
        renderedContent: {
          html: renderedResult.html,
          plainText: renderedResult.plainText
        },
        metadata: {
          generatedBy: userId,
          organisation: template.metadata.organisation
        }
      });
      
      // Save generated offer
      await generatedOffer.save();
      
      // Generate PDF using PDF generator service
      const pdfGenerator = require('./pdfGenerator');
      
      const pdfPath = await pdfGenerator.generateOfferLetterPDF(
        template,
        candidateData,
        companyData,
        null, // salaryBreakdown - can be null for now
        {
          filename: `offer-${candidateData.candidate_name}-${Date.now()}.pdf`,
          includeCompanyBranding: !!companyData
        }
      );
      
      // Update the offer with PDF path
      generatedOffer.renderedContent.pdfPath = pdfPath;
      await generatedOffer.save();
      
      return {
        success: true,
        offer: generatedOffer,
        renderedContent: renderedResult
      };
      
    } catch (error) {
      console.error('Offer generation error:', error);
      throw error;
    }
  }
}

module.exports = new TemplateEngine();