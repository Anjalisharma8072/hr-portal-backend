const { errorResponse } = require('../../../utils/apiResponse');

/**
 * Validate template creation data
 */
exports.validateTemplateCreation = (req, res, next) => {
  try {
    const { name, content, department } = req.body;

    // Check required fields
    if (!name || !name.trim()) {
      return errorResponse(res, 'Template name is required', 400);
    }

    if (!content) {
      return errorResponse(res, 'Template content is required', 400);
    }

    if (!department) {
      return errorResponse(res, 'Department is required', 400);
    }

    // Validate name length
    if (name.trim().length < 3 || name.trim().length > 100) {
      return errorResponse(res, 'Template name must be between 3 and 100 characters', 400);
    }

    // Validate content structure
    if (!content.sections || !Array.isArray(content.sections)) {
      return errorResponse(res, 'Template must have sections array', 400);
    }

    if (content.sections.length === 0) {
      return errorResponse(res, 'Template must have at least one section', 400);
    }

    // Validate sections
    for (let i = 0; i < content.sections.length; i++) {
      const section = content.sections[i];
      
      if (!section.id || !section.type) {
        return errorResponse(res, `Section ${i + 1} must have id and type`, 400);
      }

      if (!section.content && (!section.blocks || section.blocks.length === 0)) {
        return errorResponse(res, `Section ${i + 1} must have content or blocks`, 400);
      }
    }

    next();
  } catch (error) {
    console.error('❌ [TemplateValidation] Validation error:', error);
    return errorResponse(res, 'Template validation failed', 400);
  }
};

/**
 * Validate template update data
 */
exports.validateTemplateUpdate = (req, res, next) => {
  try {
    const { name, content } = req.body;

    // Validate name if provided
    if (name !== undefined) {
      if (!name || !name.trim()) {
        return errorResponse(res, 'Template name cannot be empty', 400);
      }

      if (name.trim().length < 3 || name.trim().length > 100) {
        return errorResponse(res, 'Template name must be between 3 and 100 characters', 400);
      }
    }

    // Validate content if provided
    if (content) {
      if (!content.sections || !Array.isArray(content.sections)) {
        return errorResponse(res, 'Template must have sections array', 400);
      }

      if (content.sections.length === 0) {
        return errorResponse(res, 'Template must have at least one section', 400);
      }

      // Validate sections
      for (let i = 0; i < content.sections.length; i++) {
        const section = content.sections[i];
        
        if (!section.id || !section.type) {
          return errorResponse(res, `Section ${i + 1} must have id and type`, 400);
        }

        if (!section.content && (!section.blocks || section.blocks.length === 0)) {
          return errorResponse(res, `Section ${i + 1} must have content or blocks`, 400);
        }
      }
    }

    next();
  } catch (error) {
    console.error('❌ [TemplateValidation] Update validation error:', error);
    return errorResponse(res, 'Template update validation failed', 400);
  }
};

/**
 * Validate template duplication
 */
exports.validateTemplateDuplication = (req, res, next) => {
  try {
    const { newName } = req.body;

    if (!newName || !newName.trim()) {
      return errorResponse(res, 'New template name is required', 400);
    }

    if (newName.trim().length < 3 || newName.trim().length > 100) {
      return errorResponse(res, 'New template name must be between 3 and 100 characters', 400);
    }

    next();
  } catch (error) {
    console.error('❌ [TemplateValidation] Duplication validation error:', error);
    return errorResponse(res, 'Template duplication validation failed', 400);
  }
};

/**
 * Validate template preview
 */
exports.validateTemplatePreview = (req, res, next) => {
  try {
    const { sampleData } = req.body;

    // Sample data is optional, but if provided, validate basic structure
    if (sampleData && typeof sampleData !== 'object') {
      return errorResponse(res, 'Sample data must be an object', 400);
    }

    next();
  } catch (error) {
    console.error('❌ [TemplateValidation] Preview validation error:', error);
    return errorResponse(res, 'Template preview validation failed', 400);
  }
};
