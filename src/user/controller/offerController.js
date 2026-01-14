const GeneratedOffer = require('../model/generatedOffer');
const Template = require('../model/template');
const Company = require('../model/company');
const templateEngine = require('../services/templateEngine');
const pdfGenerator = require('../services/pdfGenerator');
const emailService = require('../services/emailService');
const searchService = require('../services/searchService');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');

/**
 * Generate offer from template
 */
exports.generateOffer = async (req, res) => {
  try {
    console.log('🎯 [Offer] Generate offer request received:', {
      body: req.body,
      userId: req.user.id
    });

    const {
      templateId,
      candidateData,
      settings,
      companyId
    } = req.body;

    // Validate required fields
    if (!templateId || !candidateData) {
      return errorResponse(res, 'Template ID and candidate data are required', 400);
    }

    // Validate candidate data
    if (!candidateData.candidate_name || !candidateData.candidate_email || 
        !candidateData.designation || !candidateData.department || 
        !candidateData.base_salary || !candidateData.total_ctc) {
      return errorResponse(res, 'Missing required candidate information', 400);
    }

    // Check if template exists and user has access
    const template = await Template.findOne({
      _id: templateId,
      'metadata.organisation': req.user.organisation,
      isActive: true
    });

    if (!template) {
      return errorResponse(res, 'Template not found or access denied', 404);
    }

    // Get company data if companyId is provided
    let companyData = null;
    if (companyId) {
      companyData = await Company.findOne({
        _id: companyId,
        organisation: req.user.organisation,
        user: req.user.id
      });

      if (!companyData) {
        return errorResponse(res, 'Company not found or access denied', 404);
      }
    }

    // Generate offer using template engine
    const result = await templateEngine.generateOffer(templateId, candidateData, req.user.id, companyData);

    // Apply custom settings if provided
    if (settings) {
      Object.assign(result.offer.settings, settings);
      await result.offer.save();
    }

    console.log('✅ [Offer] Offer generated successfully:', result.offer._id);

    return successResponse(res, 'Offer generated successfully', {
      offer: {
        id: result.offer._id,
        templateId: result.offer.templateId,
        templateName: template.name,
        candidateName: candidateData.candidate_name,
        candidateEmail: candidateData.candidate_email,
        designation: candidateData.designation,
        department: candidateData.department,
        status: result.offer.status,
        createdAt: result.offer.createdAt,
        pdfPath: result.offer.renderedContent.pdfPath,
        companyName: companyData?.companyName || 'Standard'
      }
    });

  } catch (error) {
    console.error('❌ [Offer] Generate offer error:', error);
    return errorResponse(res, `Error generating offer: ${error.message}`, 500);
  }
};

/**
 * Generate offer with company-specific data
 */
exports.generateCompanyOffer = async (req, res) => {
  try {
    console.log('🏢 [Offer] Generate company offer request received:', {
      body: req.body,
      userId: req.user.id
    });

    const {
      templateId,
      candidateData,
      companyId,
      settings
    } = req.body;

    // Validate required fields
    if (!templateId || !candidateData || !companyId) {
      return errorResponse(res, 'Template ID, candidate data, and company ID are required', 400);
    }

    // Validate candidate data
    if (!candidateData.candidate_name || !candidateData.candidate_email || 
        !candidateData.designation || !candidateData.department || 
        !candidateData.base_salary || !candidateData.total_ctc) {
      return errorResponse(res, 'Missing required candidate information', 400);
    }

    // Check if template exists and user has access
    const template = await Template.findOne({
      _id: templateId,
      'metadata.organisation': req.user.organisation,
      isActive: true
    });

    if (!template) {
      return errorResponse(res, 'Template not found or access denied', 404);
    }

    // Get company data
    const companyData = await Company.findOne({
      _id: companyId,
      organisation: req.user.organisation,
      user: req.user.id
    });

    if (!companyData) {
      return errorResponse(res, 'Company not found or access denied', 404);
    }

    // Generate offer using template engine with company data
    const result = await templateEngine.generateOffer(templateId, candidateData, req.user.id, companyData);

    // Apply company-specific settings
    if (settings) {
      Object.assign(result.offer.settings, settings);
    }

    // Apply company branding and policies
    if (companyData.branding) {
      result.offer.companyData = {
        companyId: companyData._id,
        companyName: companyData.companyName,
        industry: companyData.industry,
        companyType: companyData.companyType,
        branding: companyData.branding,
        policies: companyData.policies
      };
    }

    await result.offer.save();

    console.log('✅ [Offer] Company offer generated successfully:', result.offer._id);

    return successResponse(res, 'Company offer generated successfully', {
      offer: {
        id: result.offer._id,
        templateId: result.offer.templateId,
        templateName: template.name,
        candidateName: candidateData.candidate_name,
        candidateEmail: candidateData.candidate_email,
        designation: candidateData.designation,
        department: candidateData.department,
        status: result.offer.status,
        createdAt: result.offer.createdAt,
        pdfPath: result.offer.renderedContent.pdfPath,
        companyName: companyData.companyName,
        industry: companyData.industry,
        companyType: companyData.companyType
      }
    });

  } catch (error) {
    console.error('❌ [Offer] Generate company offer error:', error);
    return errorResponse(res, `Error generating company offer: ${error.message}`, 500);
  }
};

/**
 * Generate PDF for an offer
 */
exports.generateOfferPDF = async (req, res) => {
  try {
    console.log('📄 [Offer] Generate PDF request received:', {
      offerId: req.params.id,
      userId: req.user.id
    });

    const offer = await GeneratedOffer.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation
    }).populate('templateId').populate('companyData.companyId');

    if (!offer) {
      return errorResponse(res, 'Offer not found', 404);
    }

    // Get company data
    const companyData = offer.companyData || {};
    
    // Generate PDF
    const pdfResult = await pdfGenerator.generateOfferLetterPDF(
      offer.templateId,
      offer.candidateData,
      companyData,
      offer.salaryBreakdown,
      {
        companyBranding: companyData.branding,
        customCSS: companyData.branding?.customCSS
      }
    );

    // Update offer with PDF path
    offer.renderedContent.pdfPath = pdfResult.filePath;
    await offer.save();

    console.log('✅ [Offer] PDF generated successfully:', offer._id);

    return successResponse(res, 'PDF generated successfully', {
      offer: {
        id: offer._id,
        pdfPath: pdfResult.filePath,
        fileName: pdfResult.fileName
      }
    });

  } catch (error) {
    console.error('❌ [Offer] Generate PDF error:', error);
    return errorResponse(res, `Error generating PDF: ${error.message}`, 500);
  }
};

/**
 * Get all offers for user's organisation
 */
exports.getOffers = async (req, res) => {
  try {
    console.log('📋 [Offer] Get offers request received:', {
      query: req.query,
      userId: req.user.id,
      organisation: req.user.organisation
    });

    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {
      'metadata.organisation': req.user.organisation
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { 'candidateData.candidate_name': { $regex: search, $options: 'i' } },
        { 'candidateData.candidate_email': { $regex: search, $options: 'i' } },
        { 'candidateData.designation': { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [offers, total] = await Promise.all([
      GeneratedOffer.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('templateId', 'name')
        .populate('metadata.generatedBy', 'email name')
        .lean(),
      GeneratedOffer.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    console.log('✅ [Offer] Offers retrieved successfully:', { count: offers.length, total });
    
    // Debug: Log the first offer's data structure
    if (offers.length > 0) {
      console.log('🔍 [Offer] First offer data structure:', {
        id: offers[0]._id,
        candidateData: offers[0].candidateData,
        baseSalary: offers[0].candidateData?.base_salary,
        totalCtc: offers[0].candidateData?.total_ctc,
        joiningDate: offers[0].candidateData?.joining_date
      });
    }

    const mappedOffers = offers.map(offer => ({
      id: offer._id,
      templateName: offer.templateId?.name,
      candidateName: offer.candidateData.candidate_name,
      candidateEmail: offer.candidateData.candidate_email,
      designation: offer.candidateData.designation,
      department: offer.candidateData.department,
      baseSalary: offer.candidateData.base_salary,
      totalCtc: offer.candidateData.total_ctc,
      joiningDate: offer.candidateData.joining_date,
      status: offer.status,
      generatedBy: offer.metadata.generatedBy?.email,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      viewCount: offer.tracking?.viewCount || 0,
      sentAt: offer.tracking?.sentAt || null,
      expiresAt: offer.tracking?.expiresAt || null
    }));

    // Debug: Log the mapped offer data
    if (mappedOffers.length > 0) {
      console.log('🔍 [Offer] Mapped offer data:', {
        id: mappedOffers[0].id,
        baseSalary: mappedOffers[0].baseSalary,
        totalCtc: mappedOffers[0].totalCtc,
        joiningDate: mappedOffers[0].joiningDate
      });
    }

    return successResponse(res, 'Offers retrieved successfully', {
      offers: mappedOffers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('❌ [Offer] Get offers error:', error);
    return errorResponse(res, `Error retrieving offers: ${error.message}`, 500);
  }
};

/**
 * Get offer by ID
 */
exports.getOfferById = async (req, res) => {
  try {
    console.log('🔍 [Offer] Get offer by ID request received:', {
      offerId: req.params.id,
      userId: req.user.id,
      organisation: req.user.organisation
    });

    console.log('🔍 [Offer] Searching for offer with query:', {
      _id: req.params.id,
      'metadata.organisation': req.user.organisation
    });

    const offer = await GeneratedOffer.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation
    })
      .populate('templateId', 'name')
      .populate('metadata.generatedBy', 'email name');

    console.log('🔍 [Offer] Database query result:', {
      found: !!offer,
      offerId: offer?._id,
      organisation: offer?.metadata?.organisation
    });

    if (!offer) {
      console.log('❌ [Offer] Offer not found for ID:', req.params.id);
      return errorResponse(res, 'Offer not found', 404);
    }

    console.log('✅ [Offer] Offer retrieved successfully:', {
      id: offer._id,
      candidateName: offer.candidateData?.candidate_name,
      status: offer.status
    });

    return successResponse(res, 'Offer retrieved successfully', {
      offer: {
        id: offer._id,
        templateId: offer.templateId._id,
        templateName: offer.templateId.name,
        candidateData: offer.candidateData,
        status: offer.status,
        statusHistory: offer.statusHistory,
        tracking: offer.tracking,
        metadata: {
          generatedBy: offer.metadata.generatedBy,
          organisation: offer.metadata.organisation,
          industry: offer.metadata.industry,
          companyType: offer.metadata.companyType,
          location: offer.metadata.location,
          currency: offer.metadata.currency,
          complianceStatus: offer.metadata.complianceStatus
        },
        communication: offer.communication,
        analytics: offer.analytics,
        settings: offer.settings,
        renderedContent: {
          html: offer.renderedContent.html,
          plainText: offer.renderedContent.plainText,
          pdfPath: offer.renderedContent.pdfPath
        },
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ [Offer] Get offer by ID error:', error);
    return errorResponse(res, `Error retrieving offer: ${error.message}`, 500);
  }
};

/**
 * Update offer status
 */
exports.updateOfferStatus = async (req, res) => {
  try {
    console.log('✏️ [Offer] Update offer status request received:', {
      offerId: req.params.id,
      body: req.body,
      userId: req.user.id
    });

    const { status, comments } = req.body;

    if (!status) {
      return errorResponse(res, 'Status is required', 400);
    }

    const offer = await GeneratedOffer.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation
    });

    if (!offer) {
      return errorResponse(res, 'Offer not found', 404);
    }

    // Check if user has permission to update status
    if (offer.metadata.generatedBy.toString() !== req.user.id && req.user.role !== 'Admin') {
      return errorResponse(res, 'You can only update offers you generated', 403);
    }

    // Update status
    await offer.updateStatus(status, req.user.id, comments);

    console.log('✅ [Offer] Offer status updated successfully:', { offerId: offer._id, status });

    return successResponse(res, 'Offer status updated successfully', {
      offer: {
        id: offer._id,
        status: offer.status,
        updatedAt: offer.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ [Offer] Update offer status error:', error);
    return errorResponse(res, `Error updating offer status: ${error.message}`, 500);
  }
};

/**
 * Send offer to candidate
 */
exports.sendOffer = async (req, res) => {
  try {
    console.log('📧 [Offer] Send offer request received:', {
      offerId: req.params.id,
      body: req.body,
      userId: req.user.id
    });

    const { 
      emailSubject, 
      emailBody, 
      includePDF = true,
      cc = [],
      bcc = []
    } = req.body;

    if (!emailSubject || !emailBody) {
      return errorResponse(res, 'Email subject and body are required', 400);
    }

    const offer = await GeneratedOffer.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation
    }).populate('templateId').populate('companyData.companyId');

    if (!offer) {
      return errorResponse(res, 'Offer not found', 404);
    }

    // Check if offer is in a valid state to send
    if (!['draft', 'approved'].includes(offer.status)) {
      return errorResponse(res, 'Offer must be in draft or approved status to send', 400);
    }

    let emailResult;

    if (includePDF && !offer.renderedContent.pdfPath) {
      // Generate PDF first if not exists
      console.log('📄 [Offer] Generating PDF for offer:', offer._id);
      
      const pdfResult = await pdfGenerator.generateOfferLetterPDF(
        offer.templateId,
        offer.candidateData,
        offer.companyData,
        offer.salaryBreakdown,
        {
          companyBranding: offer.companyData?.branding,
          customCSS: offer.companyData?.branding?.customCSS
        }
      );

      // Update offer with PDF path
      offer.renderedContent.pdfPath = pdfResult.filePath;
      await offer.save();

      // Send email with PDF attachment
      emailResult = await emailService.sendOfferLetterWithPDF(
        offer,
        pdfResult.filePath,
        {
          subject: emailSubject,
          body: emailBody,
          cc,
          bcc
        }
      );
    } else if (includePDF && offer.renderedContent.pdfPath) {
      // Send email with existing PDF
      emailResult = await emailService.sendOfferLetterWithPDF(
        offer,
        offer.renderedContent.pdfPath,
        {
          subject: emailSubject,
          body: emailBody,
          cc,
          bcc
        }
      );
    } else {
      // Send email without PDF
      emailResult = await emailService.sendOfferLetter(offer, {
        subject: emailSubject,
        body: emailBody,
        cc,
        bcc
      });
    }

    // Update offer status and tracking
    await offer.updateStatus('sent', req.user.id, 'Offer sent to candidate');
    
    // Update communication tracking
    offer.communication.emailSentAt = new Date();
    offer.communication.lastEmailSent = {
      subject: emailSubject,
      body: emailBody,
      sentBy: req.user.id,
      sentAt: new Date(),
      messageId: emailResult.messageId
    };
    
    await offer.save();

    console.log('✅ [Offer] Offer sent successfully:', offer._id);

    return successResponse(res, 'Offer sent successfully', {
      offer: {
        id: offer._id,
        status: offer.status,
        sentAt: offer.tracking.sentAt,
        emailSentAt: offer.communication.emailSentAt,
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl
      }
    });

  } catch (error) {
    console.error('❌ [Offer] Send offer error:', error);
    return errorResponse(res, `Error sending offer: ${error.message}`, 500);
  }
};

/**
 * Send offer reminder
 */
exports.sendOfferReminder = async (req, res) => {
  try {
    console.log('📧 [Offer] Send reminder request received:', {
      offerId: req.params.id,
      body: req.body,
      userId: req.user.id
    });

    const { reminderType = 'followup', customMessage } = req.body;

    const offer = await GeneratedOffer.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation
    }).populate('templateId').populate('companyData.companyId');

    if (!offer) {
      return errorResponse(res, 'Offer not found', 404);
    }

    // Check if offer can receive reminders
    if (!['sent', 'viewed'].includes(offer.status)) {
      return errorResponse(res, 'Offer is not in a valid state to send reminders', 400);
    }

    // Send reminder email
    const emailResult = await emailService.sendOfferReminder(offer, reminderType);

    // Update communication tracking
    offer.communication.reminders = offer.communication.reminders || [];
    offer.communication.reminders.push({
      type: reminderType,
      sentBy: req.user.id,
      sentAt: new Date(),
      messageId: emailResult.messageId,
      customMessage
    });

    await offer.save();

    console.log('✅ [Offer] Reminder sent successfully:', offer._id);

    return successResponse(res, 'Reminder sent successfully', {
      offer: {
        id: offer._id,
        reminderType,
        sentAt: new Date(),
        messageId: emailResult.messageId,
        previewUrl: emailResult.previewUrl
      }
    });

  } catch (error) {
    console.error('❌ [Offer] Send reminder error:', error);
    return errorResponse(res, `Error sending reminder: ${error.message}`, 500);
  }
};

/**
 * Mark offer as viewed
 */
exports.markOfferAsViewed = async (req, res) => {
  try {
    console.log('👁️ [Offer] Mark offer as viewed request received:', {
      offerId: req.params.id,
      userId: req.user.id
    });

    const offer = await GeneratedOffer.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation
    });

    if (!offer) {
      return errorResponse(res, 'Offer not found', 404);
    }

    // Mark as viewed
    await offer.markAsViewed(req.ip, req.get('User-Agent'));

    // Update status if not already viewed
    if (offer.status === 'sent') {
      await offer.updateStatus('viewed', req.user.id, 'Offer viewed by candidate');
    }

    console.log('✅ [Offer] Offer marked as viewed:', offer._id);

    return successResponse(res, 'Offer marked as viewed', {
      offer: {
        id: offer._id,
        status: offer.status,
        viewedAt: offer.tracking.viewedAt,
        viewCount: offer.tracking.viewCount
      }
    });

  } catch (error) {
    console.error('❌ [Offer] Mark offer as viewed error:', error);
    return errorResponse(res, `Error marking offer as viewed: ${error.message}`, 500);
  }
};

/**
 * Download offer PDF
 */
exports.downloadOfferPDF = async (req, res) => {
  try {
    console.log('📥 [Offer] Download offer PDF request received:', {
      offerId: req.params.id,
      userId: req.user.id
    });

    const offer = await GeneratedOffer.findOne({
      _id: req.params.id,
      'metadata.organisation': req.user.organisation
    });

    if (!offer) {
      return errorResponse(res, 'Offer not found', 404);
    }

    console.log('📥 [Offer] Offer found:', {
      id: offer._id,
      hasRenderedContent: !!offer.renderedContent,
      hasPdfPath: !!offer.renderedContent?.pdfPath,
      pdfPath: offer.renderedContent?.pdfPath,
      hasSettings: !!offer.settings,
      allowDownload: offer.settings?.allowDownload
    });

    // Check if PDF exists, if not generate it
    if (!offer.renderedContent?.pdfPath) {
      console.log('📄 [Offer] PDF not found, generating PDF for offer:', offer._id);
      
      try {
        // Populate template if not already populated
        if (!offer.templateId || typeof offer.templateId === 'string') {
          const Template = require('../model/template');
          offer.templateId = await Template.findById(offer.templateId);
        }
        
        // Generate PDF first
        const pdfResult = await pdfGenerator.generateOfferLetterPDF(
          offer.templateId,
          offer.candidateData,
          offer.companyData || {},
          offer.salaryBreakdown,
          {
            companyBranding: offer.companyData?.branding,
            customCSS: offer.companyData?.branding?.customCSS
          }
        );

        // Update offer with PDF path
        if (!offer.renderedContent) {
          offer.renderedContent = {};
        }
        offer.renderedContent.pdfPath = pdfResult.filePath;
        await offer.save();
        
        console.log('✅ [Offer] PDF generated and saved:', pdfResult.filePath);
      } catch (pdfError) {
        console.error('❌ [Offer] Error generating PDF:', pdfError);
        return errorResponse(res, `Error generating PDF: ${pdfError.message}`, 500);
      }
    }

    // Check if download is allowed (default to true if settings don't exist)
    if (offer.settings && offer.settings.allowDownload === false) {
      return errorResponse(res, 'Downloading is not allowed for this offer', 403);
    }

    const fs = require('fs');
    if (!fs.existsSync(offer.renderedContent.pdfPath)) {
      return errorResponse(res, 'PDF file not found on server', 404);
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=offer-${offer._id}.pdf`);

    // Stream the PDF file
    const fileStream = fs.createReadStream(offer.renderedContent.pdfPath);
    fileStream.pipe(res);

    console.log('✅ [Offer] Offer PDF downloaded successfully:', offer._id);

  } catch (error) {
    console.error('❌ [Offer] Download offer PDF error:', error);
    return errorResponse(res, `Error downloading PDF: ${error.message}`, 500);
  }
};

/**
 * Bulk generate offers
 */
exports.bulkGenerateOffers = async (req, res) => {
  try {
    console.log('📚 [Offer] Bulk generate offers request received:', {
      body: req.body,
      userId: req.user.id
    });

    const { templateId, candidates } = req.body;

    if (!templateId || !Array.isArray(candidates) || candidates.length === 0) {
      return errorResponse(res, 'Template ID and candidates array are required', 400);
    }

    // Validate template
    const template = await Template.findOne({
      _id: templateId,
      'metadata.organisation': req.user.organisation,
      isActive: true
    });

    if (!template) {
      return errorResponse(res, 'Template not found or access denied', 404);
    }

    const results = [];
    const errors = [];

    // Process each candidate
    for (const candidateData of candidates) {
      try {
        // Validate candidate data
        if (!candidateData.candidate_name || !candidateData.candidate_email || 
            !candidateData.designation || !candidateData.department || 
            !candidateData.base_salary || !candidateData.total_ctc) {
          errors.push(`Invalid data for candidate ${candidateData.candidate_name || 'unknown'}`);
          continue;
        }

        // Generate offer
        const result = await templateEngine.generateOffer(templateId, candidateData, req.user.id, null);
        results.push({
          candidateName: candidateData.candidate_name,
          candidateEmail: candidateData.candidate_email,
          offerId: result.offer._id,
          status: result.offer.status,
          pdfPath: result.offer.renderedContent.pdfPath
        });

      } catch (error) {
        errors.push(`Error generating offer for ${candidateData.candidate_name || 'unknown'}: ${error.message}`);
      }
    }

    console.log('✅ [Offer] Bulk offer generation completed:', {
      generated: results.length,
      errors: errors.length
    });

    return successResponse(res, 'Bulk offer generation completed', {
      generatedOffers: results,
      errors
    });

  } catch (error) {
    console.error('❌ [Offer] Bulk generate offers error:', error);
    return errorResponse(res, `Error in bulk offer generation: ${error.message}`, 500);
  }
};

/**
 * Advanced search for offers
 */
exports.advancedSearch = async (req, res) => {
  try {
    console.log('🔍 [Offer] Advanced search request received:', {
      body: req.body,
      userId: req.user.id
    });

    const searchParams = req.body;

    // Validate search parameters
    if (!searchParams) {
      return errorResponse(res, 'Search parameters are required', 400);
    }

    // Execute advanced search
    const searchResults = await searchService.searchOffers(
      searchParams,
      req.user.id,
      req.user.organisation
    );

    console.log('✅ [Offer] Advanced search completed successfully');

    return successResponse(res, 'Search completed successfully', searchResults);

  } catch (error) {
    console.error('❌ [Offer] Advanced search error:', error);
    return errorResponse(res, `Error performing search: ${error.message}`, 500);
  }
};

/**
 * Get search suggestions
 */
exports.getSearchSuggestions = async (req, res) => {
  try {
    console.log('💡 [Offer] Get search suggestions request received:', {
      query: req.query.q,
      userId: req.user.id
    });

    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return successResponse(res, 'Suggestions retrieved successfully', { suggestions: [] });
    }

    const suggestions = await searchService.getSearchSuggestions(
      query.trim(),
      req.user.organisation,
      parseInt(limit)
    );

    console.log('✅ [Offer] Search suggestions retrieved successfully');

    return successResponse(res, 'Suggestions retrieved successfully', { suggestions });

  } catch (error) {
    console.error('❌ [Offer] Get search suggestions error:', error);
    return errorResponse(res, `Error getting suggestions: ${error.message}`, 500);
  }
};

/**
 * Get filter options
 */
exports.getFilterOptions = async (req, res) => {
  try {
    console.log('🔧 [Offer] Get filter options request received:', {
      userId: req.user.id
    });

    const filterOptions = await searchService.getFilterOptions(req.user.organisation);

    console.log('✅ [Offer] Filter options retrieved successfully');

    return successResponse(res, 'Filter options retrieved successfully', { filterOptions });

  } catch (error) {
    console.error('❌ [Offer] Get filter options error:', error);
    return errorResponse(res, `Error getting filter options: ${error.message}`, 500);
  }
};

/**
 * Get offer analytics
 */
exports.getOfferAnalytics = async (req, res) => {
  try {
    console.log('📊 [Offer] Get offer analytics request received:', {
      query: req.query,
      userId: req.user.id
    });

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return errorResponse(res, 'Start date and end date are required', 400);
    }

    const analytics = await GeneratedOffer.getAnalytics(
      req.user.organisation,
      new Date(startDate),
      new Date(endDate)
    );

    console.log('✅ [Offer] Offer analytics retrieved successfully');

    return successResponse(res, 'Offer analytics retrieved successfully', {
      analytics
    });

  } catch (error) {
    console.error('❌ [Offer] Get offer analytics error:', error);
    return errorResponse(res, `Error retrieving offer analytics: ${error.message}`, 500);
  }
};