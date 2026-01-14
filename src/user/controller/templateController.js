const Template = require('../model/template');
const templateEngine = require('../services/templateEngine');
const documentParserService = require('../services/documentParserService');
const fileUploadService = require('../services/fileUploadService');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const fs = require('fs').promises;

/**
 * Create a new template
 */
exports.createTemplate = async (req, res) => {
  try {
    console.log('📝 [Template] Create template request received:', {
      body: req.body,
      userId: req.user.id,
      organisation: req.user.organisation
    });

    const {
      name,
      description,
      category,
      department,
      designation,
      salaryStructureType,
      content,
      tags,
      settings
    } = req.body;

    console.log('📝 [Template] Parsed request data:', {
      name,
      description,
      category,
      department,
      designation,
      salaryStructureType,
      hasContent: !!content,
      tagsCount: tags?.length || 0,
      hasSettings: !!settings
    });

    // Validate required fields
    if (!name || !content || !department) {
      console.log('❌ [Template] Validation failed - missing required fields:', {
        hasName: !!name,
        hasContent: !!content,
        hasDepartment: !!department
      });
      return errorResponse(res, 'Name, content, and department are required', 400);
    }

    console.log('✅ [Template] Required fields validation passed');

    // Validate template content
    console.log('🔍 [Template] Validating template content...');
    const validation = templateEngine.validateTemplate({ content });
    if (!validation.isValid) {
      console.log('❌ [Template] Template validation failed:', validation.errors);
      return errorResponse(res, `Template validation failed: ${validation.errors.join(', ')}`, 400);
    }
    console.log('✅ [Template] Template content validation passed');

    // Create template
    console.log('🏗️ [Template] Creating template object...');
    const template = new Template({
      name,
      description,
      category,
      department,
      designation,
      salaryStructureType,
      content,
      metadata: {
        createdBy: req.user.id,
        organisation: req.user.organisation,
        tags: tags || [],
        complexity: content.sections?.length > 10 ? 'complex' : content.sections?.length > 5 ? 'medium' : 'simple'
      },
      settings: settings || {}
    });

    console.log('💾 [Template] Saving template to database...');
    await template.save();
    console.log('✅ [Template] Template saved successfully:', {
      id: template._id,
      name: template.name,
      version: template.version,
      complexity: template.metadata.complexity
    });

    return successResponse(res, 'Template created successfully', {
      template: {
        id: template._id,
        name: template.name,
        version: template.version,
        category: template.category,
        complexity: template.metadata.complexity,
        createdAt: template.createdAt
      }
    });

  } catch (error) {
    console.error('❌ [Template] Create template error:', error);
    return errorResponse(res, `Error creating template: ${error.message}`, 500);
  }
};

/**
 * Get all templates for user's organisation
 */
exports.getTemplates = async (req, res) => {
  try {
    console.log('📋 [Template] Get templates request received:', {
      query: req.query,
      userId: req.user.id,
      organisation: req.user.organisation
    });

    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('📋 [Template] Query parameters:', {
      page,
      limit,
      category,
      search,
      sortBy,
      sortOrder
    });

    // Build query
    const query = {
      'metadata.organisation': req.user.organisation,
      isActive: true
    };

    console.log('🔍 [Template] Base query:', query);

    if (category && category !== 'all') {
      query.category = category;
      console.log('🔍 [Template] Added category filter:', category);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(search, 'i')] } }
      ];
      console.log('🔍 [Template] Added search filter:', search);
    }

    console.log('🔍 [Template] Final query:', JSON.stringify(query, null, 2));

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    console.log('📊 [Template] Pagination params:', { skip, limit: parseInt(limit), sort });

    console.log('🔍 [Template] Executing database queries...');
    const [templates, total] = await Promise.all([
      Template.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('metadata.createdBy', 'email')
        .populate('department', 'name')
        .lean(),
      Template.countDocuments(query)
    ]);

    console.log('✅ [Template] Database queries completed:', {
      templatesFound: templates.length,
      totalTemplates: total
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    console.log('📊 [Template] Pagination calculated:', {
      totalPages,
      currentPage: parseInt(page),
      itemsPerPage: parseInt(limit)
    });

    console.log('✅ [Template] Templates retrieved successfully:', { count: templates.length, total });

    return successResponse(res, 'Templates retrieved successfully', {
      templates: templates.map(template => ({
        id: template._id,
        name: template.name,
        description: template.description,
        category: template.category,
        version: template.version,
        complexity: template.metadata.complexity,
        tags: template.metadata.tags,
        createdBy: template.metadata.createdBy?.email,
        department: template.department?.name,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ [Template] Get templates error:', error);
    return errorResponse(res, `Error retrieving templates: ${error.message}`, 500);
  }
};

/**
 * Get template by ID
 */
exports.getTemplateById = async (req, res) => {
  try {
    console.log('🔍 [Template] Get template by ID request received:', {
      templateId: req.params.id,
      userId: req.user.id
    });

    const template = await Template.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation,
      isActive: true
    }).populate('metadata.createdBy', 'email name')
      .populate('department', 'name')
      .populate('metadata.lastModifiedBy', 'email name');

    if (!template) {
      return errorResponse(res, 'Template not found', 404);
    }

    console.log('✅ [Template] Template retrieved successfully:', template._id);

    return successResponse(res, 'Template retrieved successfully', {
      template: {
        id: template._id,
        name: template.name,
        description: template.description,
        category: template.category,
        department: template.department,
        designation: template.designation,
        salaryStructureType: template.salaryStructureType,
        version: template.version,
        content: template.content,
        metadata: {
          createdBy: template.metadata.createdBy,
          lastModifiedBy: template.metadata.lastModifiedBy,
          tags: template.metadata.tags,
          complexity: template.metadata.complexity,
          estimatedCompletionTime: template.metadata.estimatedCompletionTime
        },
        settings: template.settings,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ [Template] Get template by ID error:', error);
    return errorResponse(res, `Error retrieving template: ${error.message}`, 500);
  }
};

/**
 * Update template
 */
exports.updateTemplate = async (req, res) => {
  try {
    console.log('✏️ [Template] Update template request received:', {
      templateId: req.params.id,
      body: req.body,
      userId: req.user.id
    });

    const template = await Template.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation,
      isActive: true
    });

    if (!template) {
      return errorResponse(res, 'Template not found', 404);
    }

    // Check if user can edit template
    if (template.metadata.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return errorResponse(res, 'You can only edit templates you created', 403);
    }

    const updateData = { ...req.body };
    
    // If content is being updated, validate it
    if (updateData.content) {
      const validation = templateEngine.validateTemplate({ content: updateData.content });
      if (!validation.isValid) {
        return errorResponse(res, `Template validation failed: ${validation.errors.join(', ')}`, 400);
      }
    }

    // Update template
    Object.assign(template, updateData);
    template.metadata.lastModifiedBy = req.user.id;

    await template.save();

    console.log('✅ [Template] Template updated successfully:', template._id);

    return successResponse(res, 'Template updated successfully', {
      template: {
        id: template._id,
        name: template.name,
        version: template.version,
        updatedAt: template.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ [Template] Update template error:', error);
    return errorResponse(res, `Error updating template: ${error.message}`, 500);
  }
};

/**
 * Duplicate template
 */
exports.duplicateTemplate = async (req, res) => {
  try {
    console.log('📋 [Template] Duplicate template request received:', {
      templateId: req.params.id,
      body: req.body,
      userId: req.user.id
    });

    const { newName } = req.body;

    if (!newName) {
      return errorResponse(res, 'New name is required for duplication', 400);
    }

    const originalTemplate = await Template.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation,
      isActive: true
    });

    if (!originalTemplate) {
      return errorResponse(res, 'Template not found', 404);
    }

    // Check if user can duplicate template
    if (!originalTemplate.settings.allowDuplication && 
        originalTemplate.metadata.createdBy.toString() !== req.user.id) {
      return errorResponse(res, 'Template duplication not allowed', 403);
    }

    // Create duplicate
    const duplicateTemplate = originalTemplate.duplicate(newName, req.user.id);
    await duplicateTemplate.save();

    console.log('✅ [Template] Template duplicated successfully:', duplicateTemplate._id);

    return successResponse(res, 'Template duplicated successfully', {
      template: {
        id: duplicateTemplate._id,
        name: duplicateTemplate.name,
        version: duplicateTemplate.version,
        createdAt: duplicateTemplate.createdAt
      }
    });

  } catch (error) {
    console.error('❌ [Template] Duplicate template error:', error);
    return errorResponse(res, `Error duplicating template: ${error.message}`, 500);
  }
};

/**
 * Delete template (soft delete)
 */
exports.deleteTemplate = async (req, res) => {
  try {
    console.log('🗑️ [Template] Delete template request received:', {
      templateId: req.params.id,
      userId: req.user.id
    });

    const template = await Template.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation,
      isActive: true
    });

    if (!template) {
      return errorResponse(res, 'Template not found', 404);
    }

    // Check if user can delete template
    if (template.metadata.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return errorResponse(res, 'You can only delete templates you created', 403);
    }

    // Soft delete
    template.isActive = false;
    template.metadata.lastModifiedBy = req.user.id;
    await template.save();

    console.log('✅ [Template] Template deleted successfully:', template._id);

    return successResponse(res, 'Template deleted successfully');

  } catch (error) {
    console.error('❌ [Template] Delete template error:', error);
    return errorResponse(res, `Error deleting template: ${error.message}`, 500);
  }
};

/**
 * Get template placeholders
 */
exports.getTemplatePlaceholders = async (req, res) => {
  try {
    console.log('🔍 [Template] Get placeholders request received:', {
      templateId: req.params.id,
      userId: req.user.id
    });

    const template = await Template.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation,
      isActive: true
    });

    if (!template) {
      return errorResponse(res, 'Template not found', 404);
    }

    const placeholders = templateEngine.parsePlaceholders(template);

    console.log('✅ [Template] Placeholders retrieved successfully:', { count: placeholders.length });

    return successResponse(res, 'Template placeholders retrieved successfully', {
      placeholders: placeholders.map(placeholder => {
        const definedPlaceholder = template.content.placeholders?.find(p => p.key === placeholder);
        return {
          key: placeholder,
          label: definedPlaceholder?.label || placeholder,
          type: definedPlaceholder?.type || 'text',
          required: definedPlaceholder?.required || false,
          defaultValue: definedPlaceholder?.defaultValue || '',
          description: definedPlaceholder?.description || '',
          category: definedPlaceholder?.category || 'candidate'
        };
      })
    });

  } catch (error) {
    console.error('❌ [Template] Get placeholders error:', error);
    return errorResponse(res, `Error retrieving placeholders: ${error.message}`, 500);
  }
};

/**
 * Preview template with sample data
 */
exports.previewTemplate = async (req, res) => {
  try {
    console.log('👁️ [Template] Preview template request received:', {
      templateId: req.params.id,
      body: req.body,
      userId: req.user.id
    });

    const { sampleData } = req.body;

    const template = await Template.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation,
      isActive: true
    });

    if (!template) {
      return errorResponse(res, 'Template not found', 404);
    }

    // Render template with sample data
    const renderedResult = await templateEngine.renderTemplate(template, sampleData || {});

    console.log('✅ [Template] Template preview generated successfully');

    return successResponse(res, 'Template preview generated successfully', {
      preview: {
        html: renderedResult.html,
        plainText: renderedResult.plainText,
        placeholders: renderedResult.placeholders
      }
    });

  } catch (error) {
    console.error('❌ [Template] Preview template error:', error);
    return errorResponse(res, `Error generating preview: ${error.message}`, 500);
  }
};

/**
 * Get template statistics
 */
exports.getTemplateStats = async (req, res) => {
  try {
    console.log('📊 [Template] Get template stats request received:', {
      userId: req.user.id,
      organisation: req.user.organisation
    });

    const stats = await Template.aggregate([
      {
        $match: {
          'metadata.organisation': req.user.organisation,
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalTemplates: { $sum: 1 },
          byCategory: {
            $push: '$category'
          },
          byComplexity: {
            $push: '$metadata.complexity'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalTemplates: 1,
          categoryBreakdown: {
            $reduce: {
              input: '$byCategory',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $literal: {
                      $concat: ['$$this', ': ', { $add: [1, { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }] }]
                    }
                  }
                ]
              }
            }
          },
          complexityBreakdown: {
            $reduce: {
              input: '$byComplexity',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $literal: {
                      $concat: ['$$this', ': ', { $add: [1, { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }] }]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalTemplates: 0,
      categoryBreakdown: {},
      complexityBreakdown: {}
    };

    console.log('✅ [Template] Template stats retrieved successfully');

    return successResponse(res, 'Template statistics retrieved successfully', {
      stats: result
    });

  } catch (error) {
    console.error('❌ [Template] Get template stats error:', error);
    return errorResponse(res, `Error retrieving template statistics: ${error.message}`, 500);
  }
};

/**
 * Upload and parse document to create template
 */
exports.uploadAndParseTemplate = async (req, res) => {
  try {
    console.log('📤 [Template] Upload and parse template request received:', {
      userId: req.user.id,
      organisation: req.user.organisation,
      hasFile: !!req.file
    });

    if (!req.file) {
      return errorResponse(res, 'No file uploaded. Please upload a Word (.docx) or PDF file.', 400);
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      // Clean up uploaded file
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting invalid file:', unlinkError);
      }
      return errorResponse(res, 'Invalid file type. Only Word (.docx) and PDF files are supported.', 400);
    }

    // Parse the document
    console.log('📄 [Template] Parsing document...');
    const parsedTemplate = await documentParserService.parseDocument(req.file);

    // Clean up uploaded file after parsing
    try {
      await fs.unlink(req.file.path);
      console.log('🗑️ [Template] Temporary file deleted:', req.file.path);
    } catch (unlinkError) {
      console.warn('⚠️ [Template] Could not delete temporary file:', unlinkError.message);
    }

    // Add user metadata
    parsedTemplate.metadata = {
      ...parsedTemplate.metadata,
      createdBy: req.user.id,
      organisation: req.user.organisation,
      source: 'document_upload',
      uploadedAt: new Date()
    };

    // Set default department if not provided
    if (!parsedTemplate.department) {
      parsedTemplate.department = req.body.department || 'General';
    }

    // Set category if provided
    if (req.body.category) {
      parsedTemplate.category = req.body.category;
    }

    console.log('✅ [Template] Document parsed successfully:', {
      templateName: parsedTemplate.name,
      sectionsCount: parsedTemplate.content.sections?.length || 0,
      placeholdersCount: parsedTemplate.content.placeholders?.length || 0
    });

    return successResponse(res, 'Document parsed successfully. Review and save the template.', {
      template: parsedTemplate,
      preview: {
        sectionsCount: parsedTemplate.content.sections?.length || 0,
        placeholdersCount: parsedTemplate.content.placeholders?.length || 0,
        estimatedComplexity: parsedTemplate.content.sections?.length > 10 ? 'complex' : 
                             parsedTemplate.content.sections?.length > 5 ? 'medium' : 'simple'
      }
    });

  } catch (error) {
    console.error('❌ [Template] Upload and parse error:', error);
    
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file on error:', unlinkError);
      }
    }

    return errorResponse(res, `Error parsing document: ${error.message}`, 500);
  }
};