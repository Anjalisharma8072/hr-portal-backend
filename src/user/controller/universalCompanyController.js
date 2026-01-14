/**
 * Universal Company Controller
 * Handles operations for any company type, industry, and location
 * Based on the optimized Company model
 */

const Company = require('../model/company');
const Organisation = require('../../organisation/model/organisation');
const Template = require('../model/template');
const GeneratedOffer = require('../model/generatedOffer');
const enhancedTemplateEngine = require('../services/enhancedTemplateEngine');
const salaryCalculator = require('../services/salaryCalculator');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');

/**
 * Setup company profile and defaults
 */
exports.setupCompany = async (req, res) => {
  try {
    console.log('🏢 [Universal Company] Setup company request received:', {
      body: req.body,
      userId: req.user.id,
      userOrganisation: req.user.organisation
    });

    const {
      organisation, // Organisation ID from user
      profile, // Company profile data
      branding,
      salaryStructure,
      employmentTerms,
      benefits,
      policies,
      settings
    } = req.body;

    console.log('🏢 [Universal Company] Parsed request data:', {
      organisation,
      hasProfile: !!profile,
      profileKeys: profile ? Object.keys(profile) : [],
      hasBranding: !!branding,
      hasSalaryStructure: !!salaryStructure,
      hasEmploymentTerms: !!employmentTerms,
      hasBenefits: !!benefits,
      hasPolicies: !!policies,
      hasSettings: !!settings
    });

    // Validate required fields
    if (!organisation || !profile?.companyName || !profile?.industry || !profile?.companyType) {
      console.log('❌ [Universal Company] Validation failed - missing required fields:', {
        hasOrganisation: !!organisation,
        hasCompanyName: !!profile?.companyName,
        hasIndustry: !!profile?.industry,
        hasCompanyType: !!profile?.companyType
      });
      return errorResponse(res, 'Organisation, company name, industry, and company type are required', 400);
    }

    console.log('✅ [Universal Company] Required fields validation passed');

    // Verify that the user is trying to create a company for their own organisation
    if (organisation !== req.user.organisation) {
      console.log('❌ [Universal Company] Organisation mismatch:', {
        requestedOrganisation: organisation,
        userOrganisation: req.user.organisation
      });
      return errorResponse(res, 'You can only create companies for your assigned organisation', 403);
    }

    console.log('✅ [Universal Company] Organisation ownership verified');

    // Verify organisation exists
    console.log('🔍 [Universal Company] Verifying organisation exists...');
    const organisationDoc = await Organisation.findById(organisation);
    if (!organisationDoc) {
      console.log('❌ [Universal Company] Organisation not found:', organisation);
      return errorResponse(res, 'Organisation not found', 404);
    }
    console.log('✅ [Universal Company] Organisation verified:', organisationDoc.name);

    // Check if company already exists for this organisation and user
    let company = await Company.findOne({
      organisation: organisation,
      createdBy: req.user.id,
      isActive: true
    });

    if (company) {
      // Update existing company
      Object.assign(company, {
        profile: {
          ...profile,
          contactInfo: {
            email: profile.contactInfo?.email || req.user.email,
            phone: profile.contactInfo?.phone || '',
            contactPerson: profile.contactInfo?.contactPerson || req.user.name || 'User'
          }
        },
        branding,
        salaryStructure,
        employmentTerms,
        benefits,
        policies,
        settings,
        lastModifiedBy: req.user.id
      });

      await company.save();
      console.log('✅ [Universal Company] Company profile updated:', company._id);
    } else {
      // Create new company
      company = new Company({
        organisation: organisation,
        profile: {
          ...profile,
          contactInfo: {
            email: profile.contactInfo?.email || req.user.email,
            phone: profile.contactInfo?.phone || '',
            contactPerson: profile.contactInfo?.contactPerson || req.user.name || 'User'
          }
        },
        branding,
        salaryStructure,
        employmentTerms,
        benefits,
        policies,
        settings,
        createdBy: req.user.id
      });

      await company.save();
      console.log('✅ [Universal Company] Company profile created:', company._id);
    }

    return successResponse(res, 'Company setup completed successfully', {
      company: {
        id: company._id,
        organisation: company.organisation,
        profile: company.profile,
        branding: company.branding,
        salaryStructure: company.salaryStructure,
        employmentTerms: company.employmentTerms,
        benefits: company.benefits,
        policies: company.policies,
        settings: company.settings
      }
    });

  } catch (error) {
    console.error('❌ [Universal Company] Setup company error:', error);
    return errorResponse(res, `Error setting up company: ${error.message}`, 500);
  }
};

/**
 * Get company profile and configuration
 */
exports.getCompanyProfile = async (req, res) => {
  try {
    console.log('👤 [Universal Company] Get company profile request received:', {
      companyId: req.params.id,
      userId: req.user.id
    });

    const company = await Company.findById(req.params.id)
      .populate('organisation', 'organisationName organisationId')
      .populate('createdBy', 'email role');

    if (!company) {
      return errorResponse(res, 'Company not found', 404);
    }

    // Check if user has access to this company
    if (company.createdBy._id.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
      return errorResponse(res, 'Access denied', 403);
    }

    console.log('✅ [Universal Company] Company profile retrieved successfully');

    return successResponse(res, 'Company profile retrieved successfully', {
      company: {
        id: company._id,
        organisation: company.organisation,
        profile: company.profile,
        branding: company.branding,
        salaryStructure: company.salaryStructure,
        employmentTerms: company.employmentTerms,
        benefits: company.benefits,
        policies: company.policies,
        settings: company.settings,
        verificationStatus: company.verificationStatus,
        isActive: company.isActive,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ [Universal Company] Get company profile error:', error);
    return errorResponse(res, `Error retrieving company profile: ${error.message}`, 500);
  }
};

/**
 * Update company configuration
 */
exports.updateCompanyConfig = async (req, res) => {
  try {
    console.log('✏️ [Universal Company] Update company config request received:', {
      companyId: req.params.id,
      body: req.body,
      userId: req.user.id
    });

    const company = await Company.findById(req.params.id);
    if (!company) {
      return errorResponse(res, 'Company not found', 404);
    }

    // Check if user has access to this company
    if (company.createdBy.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
      return errorResponse(res, 'Access denied', 403);
    }

    // Update company configuration
    const updateData = req.body;
    Object.assign(company, updateData);
    company.lastModifiedBy = req.user.id;

    await company.save();

    console.log('✅ [Universal Company] Company configuration updated successfully');

    return successResponse(res, 'Company configuration updated successfully', {
      company: {
        id: company._id,
        organisation: company.organisation,
        profile: company.profile,
        branding: company.branding,
        salaryStructure: company.salaryStructure,
        employmentTerms: company.employmentTerms,
        benefits: company.benefits,
        policies: company.policies,
        settings: company.settings
      }
    });

  } catch (error) {
    console.error('❌ [Universal Company] Update company config error:', error);
    return errorResponse(res, `Error updating company configuration: ${error.message}`, 500);
  }
};

/**
 * Get industry-specific templates
 */
exports.getIndustryTemplates = async (req, res) => {
  try {
    console.log('🏭 [Universal Company] Get industry templates request received:', {
      industry: req.params.industry,
      userId: req.user.id
    });

    const { industry } = req.params;
    const { companyType } = req.query;

    let query = { industry: { $in: [industry, 'Universal'] } };
    if (companyType) {
      query.companyType = { $in: [companyType, 'universal'] };
    }

    const templates = await Template.find(query)
      .where('isActive', true)
      .select('name description category industry companyType metadata.complexity')
      .sort({ createdAt: -1 });

    console.log('✅ [Universal Company] Industry templates retrieved successfully:', templates.length);

    return successResponse(res, 'Industry templates retrieved successfully', {
      templates: templates.map(template => ({
        id: template._id,
        name: template.name,
        description: template.description,
        category: template.category,
        industry: template.industry,
        companyType: template.companyType,
        complexity: template.metadata?.complexity || 'medium'
      }))
    });

  } catch (error) {
    console.error('❌ [Universal Company] Get industry templates error:', error);
    return errorResponse(res, `Error retrieving industry templates: ${error.message}`, 500);
  }
};

/**
 * Generate universal offer letter
 */
exports.generateUniversalOffer = async (req, res) => {
  try {
    console.log('🎯 [Universal Company] Generate universal offer request received:', {
      body: req.body,
      userId: req.user.id
    });

    const {
      templateId,
      candidateData,
      companyId,
      customSettings
    } = req.body;

    // Validate required fields
    if (!templateId || !candidateData || !companyId) {
      return errorResponse(res, 'Template ID, candidate data, and company ID are required', 400);
    }

    // Get company data
    const company = await Company.findById(companyId);
    if (!company) {
      return errorResponse(res, 'Company not found', 404);
    }

    // Check if user has access to this company
    if (company.createdBy.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
      return errorResponse(res, 'Access denied', 403);
    }

    // Validate salary data
    const salaryValidation = salaryCalculator.validateSalaryData(candidateData);
    if (!salaryValidation.isValid) {
      return errorResponse(res, `Salary validation failed: ${salaryValidation.errors.join(', ')}`, 400);
    }

    // Generate offer using enhanced template engine
    const result = await enhancedTemplateEngine.generateUniversalOffer(
      templateId,
      candidateData,
      req.user.id,
      company
    );

    // Apply custom settings if provided
    if (customSettings) {
      Object.assign(result.offer.settings, customSettings);
      await result.offer.save();
    }

    console.log('✅ [Universal Company] Universal offer generated successfully:', result.offer._id);

    return successResponse(res, 'Universal offer generated successfully', {
      offer: {
        id: result.offer._id,
        templateId: result.offer.templateId,
        candidateName: candidateData.candidate_name,
        candidateEmail: candidateData.candidate_email,
        designation: candidateData.designation,
        department: candidateData.department,
        companyName: company.profile.companyName,
        industry: company.profile.industry,
        companyType: company.profile.companyType,
        status: result.offer.status,
        ctc: result.salaryBreakdown.ctc.annual,
        currency: result.offer.metadata.currency,
        createdAt: result.offer.createdAt,
        pdfPath: result.offer.renderedContent.pdfPath
      },
      salaryBreakdown: {
        basic: result.salaryBreakdown.basic.annual,
        hra: result.salaryBreakdown.hra.annual,
        specialAllowance: result.salaryBreakdown.specialAllowance.annual,
        grossSalary: result.salaryBreakdown.grossSalary.annual,
        ctc: result.salaryBreakdown.ctc.annual,
        netTakeHome: result.salaryBreakdown.netTakeHome.annual
      }
    });

  } catch (error) {
    console.error('❌ [Universal Company] Generate universal offer error:', error);
    return errorResponse(res, `Error generating universal offer: ${error.message}`, 500);
  }
};

/**
 * Get company analytics
 */
exports.getCompanyAnalytics = async (req, res) => {
  try {
    console.log('📊 [Universal Company] Get company analytics request received:', {
      companyId: req.params.id,
      query: req.query,
      userId: req.user.id
    });

    const { startDate, endDate } = req.query;
    const companyId = req.params.id;

    if (!startDate || !endDate) {
      return errorResponse(res, 'Start date and end date are required', 400);
    }

    // Get company data
    const company = await Company.findById(companyId);
    if (!company) {
      return errorResponse(res, 'Company not found', 404);
    }

    // Check if user has access to this company
    if (company.createdBy.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
      return errorResponse(res, 'Access denied', 403);
    }

    // Get company statistics
    const companyStats = await Company.getCompanyStats(company.organisation, new Date(startDate), new Date(endDate));

    // Get industry distribution
    const industryDistribution = await Company.getIndustryDistribution(company.organisation);

    // Get company type distribution
    const companyTypeDistribution = await Company.getCompanyTypeDistribution(company.organisation);

    // Get verification stats
    const verificationStats = await Company.getVerificationStats(company.organisation);

    console.log('✅ [Universal Company] Company analytics retrieved successfully');

    return successResponse(res, 'Company analytics retrieved successfully', {
      analytics: {
        company: companyStats,
        industry: industryDistribution,
        companyType: companyTypeDistribution,
        verification: verificationStats
      }
    });

  } catch (error) {
    console.error('❌ [Universal Company] Get company analytics error:', error);
    return errorResponse(res, `Error retrieving company analytics: ${error.message}`, 500);
  }
};

/**
 * Get company compliance status
 */
exports.getCompanyCompliance = async (req, res) => {
  try {
    console.log('✅ [Universal Company] Get company compliance request received:', {
      companyId: req.params.id,
      userId: req.user.id
    });

    const company = await Company.findById(req.params.id);
    if (!company) {
      return errorResponse(res, 'Company not found', 404);
    }

    // Check if user has access to this company
    if (company.createdBy.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
      return errorResponse(res, 'Access denied', 403);
    }

    // Get compliance status from company model
    const isCompliant = company.isCompliant();
    
    // Get business details for compliance
    const businessDetails = company.profile.businessDetails;
    const complianceStatus = {
      isCompliant,
      hasPAN: !!businessDetails.panNumber,
      hasGST: !!businessDetails.gstNumber,
      hasTAN: !!businessDetails.tanNumber,
      hasCIN: !!businessDetails.cinNumber,
      hasRegistration: !!businessDetails.registrationNumber,
      businessDetails
    };

    console.log('✅ [Universal Company] Company compliance retrieved successfully');

    return successResponse(res, 'Company compliance retrieved successfully', {
      compliance: complianceStatus
    });

  } catch (error) {
    console.error('❌ [Universal Company] Get company compliance error:', error);
    return errorResponse(res, `Error retrieving company compliance: ${error.message}`, 500);
  }
};

/**
 * Bulk generate offers for multiple candidates
 */
exports.bulkGenerateUniversalOffers = async (req, res) => {
  try {
    console.log('📚 [Universal Company] Bulk generate universal offers request received:', {
      body: req.body,
      userId: req.user.id
    });

    const {
      templateId,
      candidates,
      companyId,
      customSettings
    } = req.body;

    if (!templateId || !Array.isArray(candidates) || !companyId || candidates.length === 0) {
      return errorResponse(res, 'Template ID, candidates array, and company ID are required', 400);
    }

    // Get company data
    const company = await Company.findById(companyId);
    if (!company) {
      return errorResponse(res, 'Company not found', 404);
    }

    // Check if user has access to this company
    if (company.createdBy.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
      return errorResponse(res, 'Access denied', 403);
    }

    const results = [];
    const errors = [];

    // Process each candidate
    for (const candidateData of candidates) {
      try {
        // Validate candidate data
        const salaryValidation = salaryCalculator.validateSalaryData(candidateData);
        if (!salaryValidation.isValid) {
          errors.push(`Invalid data for candidate ${candidateData.candidate_name || 'unknown'}: ${salaryValidation.errors.join(', ')}`);
          continue;
        }

        // Generate offer
        const result = await enhancedTemplateEngine.generateUniversalOffer(
          templateId,
          candidateData,
          req.user.id,
          company
        );

        results.push({
          candidateName: candidateData.candidate_name,
          candidateEmail: candidateData.candidate_email,
          offerId: result.offer._id,
          status: result.offer.status,
          ctc: result.salaryBreakdown.ctc.annual,
          currency: result.offer.metadata.currency,
          pdfPath: result.offer.renderedContent.pdfPath
        });

      } catch (error) {
        errors.push(`Error generating offer for ${candidateData.candidate_name || 'unknown'}: ${error.message}`);
      }
    }

    console.log('✅ [Universal Company] Bulk universal offer generation completed:', {
      generated: results.length,
      errors: errors.length
    });

    return successResponse(res, 'Bulk universal offer generation completed', {
      generatedOffers: results,
      errors
    });

  } catch (error) {
    console.error('❌ [Universal Company] Bulk generate universal offers error:', error);
    return errorResponse(res, `Error in bulk universal offer generation: ${error.message}`, 500);
  }
};

/**
 * Get company summary
 */
exports.getCompanySummary = async (req, res) => {
  try {
    console.log('📋 [Universal Company] Get company summary request received:', {
      companyId: req.params.id,
      userId: req.user.id
    });

    const company = await Company.findById(req.params.id);
    if (!company) {
      return errorResponse(res, 'Company not found', 404);
    }

    // Check if user has access to this company
    if (company.createdBy.toString() !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Superadmin') {
      return errorResponse(res, 'Access denied', 403);
    }

    const summary = company.getCompanySummary();

    console.log('✅ [Universal Company] Company summary retrieved successfully');

    return successResponse(res, 'Company summary retrieved successfully', {
      summary
    });

  } catch (error) {
    console.error('❌ [Universal Company] Get company summary error:', error);
    return errorResponse(res, `Error retrieving company summary: ${error.message}`, 500);
  }
};

module.exports = exports;
