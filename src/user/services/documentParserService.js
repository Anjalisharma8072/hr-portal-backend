const mammoth = require('mammoth');
const pdfParseModule = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

/**
 * Document Parser Service
 * Extracts text and structure from Word (.docx) and PDF files
 * and converts them to template format
 */
class DocumentParserService {
  /**
   * Parse a document file (Word or PDF)
   * @param {Object} file - Multer file object
   * @returns {Promise<Object>} Parsed template data
   */
  async parseDocument(file) {
    try {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const mimeType = file.mimetype;

      console.log('📄 [DocumentParser] Parsing document:', {
        filename: file.originalname,
        extension: fileExtension,
        mimeType: mimeType,
        size: file.size
      });

      let extractedText = '';
      let htmlContent = '';

      // Parse based on file type
      if (fileExtension === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await this.parseWordDocument(file.path);
        extractedText = result.text;
        htmlContent = result.html;
      } else if (fileExtension === '.pdf' || mimeType === 'application/pdf') {
        const result = await this.parsePDFDocument(file.path);
        extractedText = result.text;
        htmlContent = result.html;
      } else {
        throw new Error('Unsupported file type. Only .docx and .pdf files are supported.');
      }

      // Extract placeholders and structure
      const placeholders = this.extractPlaceholders(extractedText);
      const sections = this.createSectionsFromText(extractedText, htmlContent);
      const templateName = this.extractTemplateName(file.originalname);

      console.log('✅ [DocumentParser] Document parsed successfully:', {
        templateName,
        placeholdersCount: placeholders.length,
        sectionsCount: sections.length
      });

      const parsedTemplate = {
        name: templateName,
        description: `Template extracted from ${file.originalname}`,
        content: {
          sections: sections,
          placeholders: placeholders,
          rawText: extractedText,
          htmlContent: htmlContent
        },
        metadata: {
          sourceFile: file.originalname,
          extractedAt: new Date(),
          placeholdersCount: placeholders.length,
          sectionsCount: sections.length
        }
      };

      // Print all parsed data
      console.log('\n📋 [DocumentParser] ========== FULL PARSED DATA ==========');
      console.log('📄 Template Name:', parsedTemplate.name);
      console.log('📝 Description:', parsedTemplate.description);
      console.log('\n🔖 Placeholders (' + placeholders.length + '):');
      placeholders.forEach((placeholder, index) => {
        console.log(`  ${index + 1}. ${placeholder.name} (${placeholder.type}) - ${placeholder.description}`);
      });
      console.log('\n📑 Sections (' + sections.length + '):');
      sections.forEach((section, index) => {
        console.log(`\n  Section ${index + 1}: ${section.title || 'Untitled'}`);
        console.log(`    Type: ${section.type}`);
        console.log(`    ID: ${section.id}`);
        if (section.content && section.content.blocks && section.content.blocks[0]) {
          const textPreview = section.content.blocks[0].text 
            ? section.content.blocks[0].text.substring(0, 100) + (section.content.blocks[0].text.length > 100 ? '...' : '')
            : 'No content';
          console.log(`    Content Preview: ${textPreview}`);
        }
        console.log(`    Order: ${section.metadata?.order || 'N/A'}`);
      });
      console.log('\n📝 Raw Text (first 500 chars):');
      console.log(extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''));
      
      // Print full JSON structure (formatted)
      console.log('\n📦 [DocumentParser] Full JSON Structure:');
      console.log(JSON.stringify(parsedTemplate, null, 2));
      
      console.log('\n📋 [DocumentParser] ========================================\n');

      return parsedTemplate;

    } catch (error) {
      console.error('❌ [DocumentParser] Error parsing document:', error);
      throw new Error(`Failed to parse document: ${error.message}`);
    }
  }

  /**
   * Parse Word document (.docx)
   * @param {string} filePath - Path to the .docx file
   * @returns {Promise<Object>} Extracted text and HTML
   */
  async parseWordDocument(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      
      // Extract text
      const textResult = await mammoth.extractRawText({ buffer });
      const text = textResult.value;

      // Extract HTML for better formatting preservation
      const htmlResult = await mammoth.convertToHtml({ buffer });
      const html = htmlResult.value;

      return {
        text: text.trim(),
        html: html
      };
    } catch (error) {
      console.error('❌ [DocumentParser] Error parsing Word document:', error);
      throw new Error(`Failed to parse Word document: ${error.message}`);
    }
  }

  /**
   * Parse PDF document
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<Object>} Extracted text and HTML
   */
  async parsePDFDocument(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      
      // pdf-parse v1.x: The module exports a function directly
      // Call it with the buffer
      const data = await pdfParseModule(buffer);

      // Ensure we have text data
      if (!data || !data.text) {
        throw new Error('No text extracted from PDF');
      }

      // Convert PDF text to simple HTML structure
      const html = this.textToHtml(data.text);

      return {
        text: data.text.trim(),
        html: html
      };
    } catch (error) {
      console.error('❌ [DocumentParser] Error parsing PDF document:', error);
      throw new Error(`Failed to parse PDF document: ${error.message}`);
    }
  }

  /**
   * Convert plain text to HTML
   * @param {string} text - Plain text
   * @returns {string} HTML formatted text
   */
  textToHtml(text) {
    // Split by double newlines for paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    return paragraphs.map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`).join('\n');
  }

  /**
   * Extract placeholders from text
   * Supports formats: {{variable}}, {{ variable }}, {variable}, [variable]
   * @param {string} text - Text to analyze
   * @returns {Array} Array of placeholder objects
   */
  extractPlaceholders(text) {
    const placeholders = [];
    const placeholderPatterns = [
      /\{\{(\w+)\}\}/g,           // {{variable}}
      /\{\{\s*(\w+)\s*\}\}/g,      // {{ variable }}
      /\{(\w+)\}/g,                // {variable}
      /\[(\w+)\]/g                 // [variable]
    ];

    const foundPlaceholders = new Set();

    placeholderPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const placeholderName = match[1].trim();
        if (!foundPlaceholders.has(placeholderName)) {
          foundPlaceholders.add(placeholderName);
          placeholders.push({
            name: placeholderName,
            type: this.detectPlaceholderType(placeholderName),
            defaultValue: '',
            isRequired: true,
            description: `Placeholder for ${placeholderName}`
          });
        }
      }
    });

    // Also detect common patterns like: Name:, Email:, Salary:, etc.
    const commonPatterns = [
      { pattern: /(?:name|full name|fullname)/i, type: 'text', name: 'candidate_name' },
      { pattern: /(?:email|email address)/i, type: 'email', name: 'email' },
      { pattern: /(?:phone|mobile|contact)/i, type: 'text', name: 'phone' },
      { pattern: /(?:salary|ctc|package)/i, type: 'number', name: 'salary' },
      { pattern: /(?:designation|position|role|title)/i, type: 'text', name: 'designation' },
      { pattern: /(?:department|dept)/i, type: 'text', name: 'department' },
      { pattern: /(?:joining date|start date|date of joining)/i, type: 'date', name: 'joining_date' },
      { pattern: /(?:company|company name|organization)/i, type: 'text', name: 'company_name' }
    ];

    commonPatterns.forEach(({ pattern, type, name }) => {
      if (pattern.test(text) && !foundPlaceholders.has(name)) {
        foundPlaceholders.add(name);
        placeholders.push({
          name: name,
          type: type,
          defaultValue: '',
          isRequired: true,
          description: `Auto-detected ${name} placeholder`
        });
      }
    });

    return placeholders;
  }

  /**
   * Detect placeholder type based on name
   * @param {string} name - Placeholder name
   * @returns {string} Type (text, number, date, email, etc.)
   */
  detectPlaceholderType(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('email')) return 'email';
    if (lowerName.includes('date') || lowerName.includes('joining') || lowerName.includes('start')) return 'date';
    if (lowerName.includes('salary') || lowerName.includes('ctc') || lowerName.includes('package') || lowerName.includes('amount')) return 'number';
    if (lowerName.includes('phone') || lowerName.includes('mobile') || lowerName.includes('contact')) return 'tel';
    if (lowerName.includes('address')) return 'textarea';
    
    return 'text';
  }

  /**
   * Create sections from extracted text
   * @param {string} text - Extracted text
   * @param {string} html - HTML content
   * @returns {Array} Array of section objects
   */
  createSectionsFromText(text, html) {
    const sections = [];
    const lines = text.split('\n').filter(line => line.trim());

    let currentSection = null;
    let sectionIndex = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Detect headers (lines that are short, uppercase, or end with colon)
      const isHeader = trimmedLine.length < 100 && 
                      (trimmedLine === trimmedLine.toUpperCase() || 
                       trimmedLine.endsWith(':') ||
                       /^[A-Z][^.!?]*$/.test(trimmedLine));

      if (isHeader && trimmedLine.length > 0) {
        // Save previous section if exists
        if (currentSection && currentSection.content.blocks && currentSection.content.blocks[0] && currentSection.content.blocks[0].text && currentSection.content.blocks[0].text.trim()) {
          sections.push(currentSection);
        }

        // Create new section
        sectionIndex++;
        currentSection = {
          id: `section_${sectionIndex}`,
          type: 'rich_text',
          title: trimmedLine.replace(':', ''),
          content: {
            blocks: [
              {
                type: 'text',
                text: ''
              }
            ]
          },
          formatting: {
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'left',
            color: '#000000'
          },
          styling: {
            fontSize: '16px',
            marginTop: '10px',
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0px'
          },
          metadata: {
            isRequired: true,
            isEditable: true,
            order: sectionIndex
          }
        };
      } else if (currentSection && trimmedLine.length > 0) {
        // Add content to current section
        if (currentSection.content.blocks[0].text) {
          currentSection.content.blocks[0].text += '\n' + trimmedLine;
        } else {
          currentSection.content.blocks[0].text = trimmedLine;
        }
      } else if (!currentSection && trimmedLine.length > 0) {
        // First section without header
        sectionIndex++;
        currentSection = {
          id: `section_${sectionIndex}`,
          type: 'rich_text',
          title: 'Introduction',
          content: {
            blocks: [
              {
                type: 'text',
                text: trimmedLine
              }
            ]
          },
          formatting: {
            fontSize: '14px',
            fontWeight: 'normal',
            textAlign: 'left',
            color: '#000000'
          },
          styling: {
            fontSize: '14px',
            marginTop: '10px',
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0px'
          },
          metadata: {
            isRequired: true,
            isEditable: true,
            order: sectionIndex
          }
        };
      }
    });

    // Add last section
    if (currentSection && currentSection.content.blocks[0].text.trim()) {
      sections.push(currentSection);
    }

    // If no sections created, create one with all text
    if (sections.length === 0) {
      sections.push({
        id: 'section_1',
        type: 'rich_text',
        title: 'Content',
        content: {
          blocks: [
            {
              type: 'text',
              text: text
            }
          ]
        },
        formatting: {
          fontSize: '14px',
          fontWeight: 'normal',
          textAlign: 'left',
          color: '#000000'
        },
        styling: {
          fontSize: '14px',
          marginTop: '10px',
          marginBottom: '10px',
          padding: '10px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '0px'
        },
        metadata: {
          isRequired: true,
          isEditable: true,
          order: 1
        }
      });
    }

    return sections;
  }

  /**
   * Extract template name from filename
   * @param {string} filename - Original filename
   * @returns {string} Template name
   */
  extractTemplateName(filename) {
    const nameWithoutExt = path.basename(filename, path.extname(filename));
    // Remove common prefixes and clean up
    return nameWithoutExt
      .replace(/^template[_\s-]*/i, '')
      .replace(/^offer[_\s-]*letter[_\s-]*/i, '')
      .replace(/[_\s-]+/g, ' ')
      .trim()
      || 'Imported Template';
  }
}

module.exports = new DocumentParserService();

