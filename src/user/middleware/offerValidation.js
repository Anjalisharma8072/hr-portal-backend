const { errorResponse } = require('../../../utils/apiResponse');

/**
 * Validate offer generation data
 */
exports.validateOfferGeneration = (req, res, next) => {
  try {
    const { templateId, candidateData } = req.body;

    // Check required fields
    if (!templateId) {
      return errorResponse(res, 'Template ID is required', 400);
    }

    if (!candidateData) {
      return errorResponse(res, 'Candidate data is required', 400);
    }

    // Validate candidate data structure
    const requiredFields = [
      'candidate_name',
      'candidate_email',
      'designation',
      'department',
      'base_salary',
      'total_ctc'
    ];

    for (const field of requiredFields) {
      if (!candidateData[field]) {
        return errorResponse(res, `Missing required field: ${field}`, 400);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateData.candidate_email)) {
      return errorResponse(res, 'Invalid email format', 400);
    }

    // Validate salary values
    if (typeof candidateData.base_salary !== 'number' || candidateData.base_salary <= 0) {
      return errorResponse(res, 'Base salary must be a positive number', 400);
    }

    if (typeof candidateData.total_ctc !== 'number' || candidateData.total_ctc <= 0) {
      return errorResponse(res, 'Total CTC must be a positive number', 400);
    }

    if (candidateData.base_salary > candidateData.total_ctc) {
      return errorResponse(res, 'Base salary cannot be greater than total CTC', 400);
    }

    // Validate optional fields if provided
    if (candidateData.hra !== undefined && (typeof candidateData.hra !== 'number' || candidateData.hra < 0)) {
      return errorResponse(res, 'HRA must be a non-negative number', 400);
    }

    if (candidateData.special_allowance !== undefined && (typeof candidateData.special_allowance !== 'number' || candidateData.special_allowance < 0)) {
      return errorResponse(res, 'Special allowance must be a non-negative number', 400);
    }

    if (candidateData.statutory_bonus !== undefined && (typeof candidateData.statutory_bonus !== 'number' || candidateData.statutory_bonus < 0)) {
      return errorResponse(res, 'Statutory bonus must be a non-negative number', 400);
    }

    // Validate joining date if provided
    if (candidateData.joining_date) {
      const joiningDate = new Date(candidateData.joining_date);
      if (isNaN(joiningDate.getTime())) {
        return errorResponse(res, 'Invalid joining date format', 400);
      }

      const today = new Date();
      if (joiningDate < today) {
        return errorResponse(res, 'Joining date cannot be in the past', 400);
      }
    }

    next();
  } catch (error) {
    console.error('❌ [OfferValidation] Generation validation error:', error);
    return errorResponse(res, 'Offer generation validation failed', 400);
  }
};

/**
 * Validate bulk offer generation data
 */
exports.validateBulkOfferGeneration = (req, res, next) => {
  try {
    const { templateId, candidates } = req.body;

    // Check required fields
    if (!templateId) {
      return errorResponse(res, 'Template ID is required', 400);
    }

    if (!candidates || !Array.isArray(candidates)) {
      return errorResponse(res, 'Candidates must be an array', 400);
    }

    if (candidates.length === 0) {
      return errorResponse(res, 'Candidates array cannot be empty', 400);
    }

    if (candidates.length > 100) {
      return errorResponse(res, 'Maximum 100 candidates allowed per bulk operation', 400);
    }

    // Validate each candidate
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      
      if (!candidate.candidate_name || !candidate.candidate_email || 
          !candidate.designation || !candidate.department || 
          !candidate.base_salary || !candidate.total_ctc) {
        return errorResponse(res, `Candidate ${i + 1}: Missing required information`, 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(candidate.candidate_email)) {
        return errorResponse(res, `Candidate ${i + 1}: Invalid email format`, 400);
      }

      // Validate salary values
      if (typeof candidate.base_salary !== 'number' || candidate.base_salary <= 0) {
        return errorResponse(res, `Candidate ${i + 1}: Base salary must be a positive number`, 400);
      }

      if (typeof candidate.total_ctc !== 'number' || candidate.total_ctc <= 0) {
        return errorResponse(res, `Candidate ${i + 1}: Total CTC must be a positive number`, 400);
      }

      if (candidate.base_salary > candidate.total_ctc) {
        return errorResponse(res, `Candidate ${i + 1}: Base salary cannot be greater than total CTC`, 400);
      }
    }

    next();
  } catch (error) {
    console.error('❌ [OfferValidation] Bulk generation validation error:', error);
    return errorResponse(res, 'Bulk offer generation validation failed', 400);
  }
};

/**
 * Validate offer status update
 */
exports.validateOfferStatusUpdate = (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 'Status is required', 400);
    }

    const validStatuses = [
      'draft',
      'pending_approval',
      'approved',
      'sent',
      'viewed',
      'accepted',
      'rejected',
      'expired',
      'withdrawn'
    ];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    next();
  } catch (error) {
    console.error('❌ [OfferValidation] Status update validation error:', error);
    return errorResponse(res, 'Offer status update validation failed', 400);
  }
};

/**
 * Validate offer sending
 */
exports.validateOfferSending = (req, res, next) => {
  try {
    const { emailSubject, emailBody } = req.body;

    // At least one communication method must be provided
    if (!emailSubject && !emailBody) {
      return errorResponse(res, 'Email subject and body are required', 400);
    }

    if (emailSubject && !emailSubject.trim()) {
      return errorResponse(res, 'Email subject cannot be empty', 400);
    }

    if (emailBody && !emailBody.trim()) {
      return errorResponse(res, 'Email body cannot be empty', 400);
    }

    // Validate subject length
    if (emailSubject && emailSubject.trim().length > 200) {
      return errorResponse(res, 'Email subject must be less than 200 characters', 400);
    }

    next();
  } catch (error) {
    console.error('❌ [OfferValidation] Offer sending validation error:', error);
    return errorResponse(res, 'Offer sending validation failed', 400);
  }
};

/**
 * Validate offer download
 */
exports.validateOfferDownload = (req, res, next) => {
  try {
    const { format } = req.query;

    if (format && !['pdf', 'word'].includes(format.toLowerCase())) {
      return errorResponse(res, 'Invalid format. Use pdf or word', 400);
    }

    next();
  } catch (error) {
    console.error('❌ [OfferValidation] Offer download validation error:', error);
    return errorResponse(res, 'Offer download validation failed', 400);
  }
};

/**
 * Validate analytics date range
 */
exports.validateAnalyticsDateRange = (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return errorResponse(res, 'Invalid start date format', 400);
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return errorResponse(res, 'Invalid end date format', 400);
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return errorResponse(res, 'Start date must be before end date', 400);
      }

      // Check if date range is not more than 1 year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      if (start < oneYearAgo) {
        return errorResponse(res, 'Start date cannot be more than 1 year ago', 400);
      }
    }

    next();
  } catch (error) {
    console.error('❌ [OfferValidation] Analytics date range validation error:', error);
    return errorResponse(res, 'Analytics date range validation failed', 400);
  }
};
