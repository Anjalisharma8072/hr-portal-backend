/**
 * Company Controller
 * Handles company profile management for offer and template flow
 */

const Company = require('../model/company');
const Organisation = require('../../organisation/model/organisation');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');

/**
 * Create or update company profile
 */
exports.setupCompany = async (req, res) => {
  try {
    console.log('🏢 [Company] Setup company request received:', {
      body: req.body,
      userId: req.user.id,
      userOrganisation: req.user.organisation
    });

    const {
      organisation, // Frontend sends 'organisation'
      profile, // Frontend sends nested profile object
      branding,
      salaryStructure,
      employmentTerms,
      benefits,
      policies,
      settings
    } = req.body;

    console.log('🏢 [Company] Parsed request data:', {
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
      console.log('❌ [Company] Validation failed - missing required fields:', {
        hasOrganisation: !!organisation,
        hasCompanyName: !!profile?.companyName,
        hasIndustry: !!profile?.industry,
        hasCompanyType: !!profile?.companyType
      });
      return errorResponse(res, 'Organisation, company name, industry, and company type are required', 400);
    }

    console.log('✅ [Company] Required fields validation passed');

    // Verify that the user is trying to create a company for their own organisation
    if (organisation !== req.user.organisation) {
      console.log('❌ [Company] Organisation mismatch:', {
        requestedOrganisation: organisation,
        userOrganisation: req.user.organisation
      });
      return errorResponse(res, 'You can only create companies for your assigned organisation', 403);
    }

    console.log('✅ [Company] Organisation ownership verified');

    // Verify organisation exists
    console.log('🔍 [Company] Verifying organisation exists...');
    const organisationDoc = await Organisation.findById(organisation);
    if (!organisationDoc) {
      console.log('❌ [Company] Organisation not found:', organisation);
      return errorResponse(res, 'Organisation not found', 404);
    }
    console.log('✅ [Company] Organisation verified:', organisationDoc.name);

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
      console.log('✅ [Company] Company profile updated:', company._id);
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
      console.log('✅ [Company] Company profile created:', company._id);
    }

    return successResponse(res, 'Company profile setup completed successfully', {
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
    console.error('❌ [Company] Setup company error:', error);
    return errorResponse(res, `Error setting up company: ${error.message}`, 500);
  }
};

/**
 * Get company profile
 */
exports.getCompanyProfile = async (req, res) => {
  try {
    console.log('👤 [Company] Get company profile request received:', {
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

    console.log('✅ [Company] Company profile retrieved successfully');

    return successResponse(res, 'Company profile retrieved successfully', {
      company: {
        id: company._id,
        organisation: company.organisation,
        profile: company.profile,
        branding: company.branding,
        salaryStructure: company.salaryStructure,
        employmentTerms: company.employmentTerms,
        benefits: company.benefits,
        requiredDocuments: company.requiredDocuments,
        compliance: company.compliance,
        industryConfig: company.industryConfig,
        policies: company.policies,
        settings: company.settings,
        createdBy: company.createdBy,
        isActive: company.isActive,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ [Company] Get company profile error:', error);
    return errorResponse(res, `Error retrieving company profile: ${error.message}`, 500);
  }
};

/**
 * Get company profile by organisation
 */
exports.getCompanyByOrganisation = async (req, res) => {
  try {
    console.log('🏢 [Company] Get company by organisation request received:', {
      organisationId: req.params.organisationId,
      userId: req.user.id
    });

    const company = await Company.findOne({
      organisation: req.params.organisationId,
      createdBy: req.user.id,
      isActive: true
    }).populate('organisation', 'organisationName organisationId');

    if (!company) {
      return errorResponse(res, 'Company profile not found for this organisation', 404);
    }

    console.log('✅ [Company] Company profile retrieved successfully');

    return successResponse(res, 'Company profile retrieved successfully', {
      company: {
        id: company._id,
        organisation: company.organisation,
        profile: company.profile,
        branding: company.branding,
        salaryStructure: company.salaryStructure,
        employmentTerms: company.employmentTerms,
        benefits: company.benefits,
        compliance: company.compliance,
        policies: company.policies,
        settings: company.settings
      }
    });

  } catch (error) {
    console.error('❌ [Company] Get company by organisation error:', error);
    return errorResponse(res, `Error retrieving company profile: ${error.message}`, 500);
  }
};

/**
 * Update company configuration
 */
exports.updateCompanyConfig = async (req, res) => {
  try {
    console.log('✏️ [Company] Update company config request received:', {
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

    console.log('✅ [Company] Company configuration updated successfully');

    return successResponse(res, 'Company configuration updated successfully', {
      company: {
        id: company._id,
        name: company.profile.companyName,
        industry: company.profile.industry,
        companyType: company.profile.companyType,
        branding: company.branding,
        salaryStructure: company.salaryStructure,
        employmentTerms: company.employmentTerms,
        benefits: company.benefits,
        compliance: company.compliance,
        policies: company.policies,
        settings: company.settings
      }
    });

  } catch (error) {
    console.error('❌ [Company] Update company config error:', error);
    return errorResponse(res, `Error updating company configuration: ${error.message}`, 500);
  }
};

/**
 * Get company benefits
 */
exports.getCompanyBenefits = async (req, res) => {
  try {
    console.log('🎁 [Company] Get company benefits request received:', {
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

    const benefits = company.getIndustryBenefits();

    console.log('✅ [Company] Company benefits retrieved successfully');

    return successResponse(res, 'Company benefits retrieved successfully', {
      benefits: benefits.map(benefit => ({
        name: benefit.name,
        type: benefit.type,
        value: benefit.value,
        isMandatory: benefit.isMandatory,
        description: benefit.description,
        annualValue: benefit.annualValue,
        monthlyValue: benefit.monthlyValue
      }))
    });

  } catch (error) {
    console.error('❌ [Company] Get company benefits error:', error);
    return errorResponse(res, `Error retrieving company benefits: ${error.message}`, 500);
  }
};

/**
 * Get company compliance status
 */
exports.getCompanyCompliance = async (req, res) => {
  try {
    console.log('📋 [Company] Get company compliance request received:', {
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

    const isCompliant = company.isCompliant();
    const compliance = company.compliance || [];

    console.log('✅ [Company] Company compliance retrieved successfully');

    return successResponse(res, 'Company compliance retrieved successfully', {
      isCompliant,
      compliance: compliance.map(comp => ({
        standard: comp.standard,
        description: comp.description,
        isRequired: comp.isRequired,
        status: comp.status,
        expiryDate: comp.expiryDate,
        certificateNumber: comp.certificateNumber
      }))
    });

  } catch (error) {
    console.error('❌ [Company] Get company compliance error:', error);
    return errorResponse(res, `Error retrieving company compliance: ${error.message}`, 500);
  }
};

/**
 * Delete company profile (soft delete)
 */
exports.deleteCompany = async (req, res) => {
  try {
    console.log('🗑️ [Company] Delete company request received:', {
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

    // Soft delete
    company.isActive = false;
    company.lastModifiedBy = req.user.id;
    await company.save();

    console.log('✅ [Company] Company profile deleted successfully');

    return successResponse(res, 'Company profile deleted successfully');

  } catch (error) {
    console.error('❌ [Company] Delete company error:', error);
    return errorResponse(res, `Error deleting company profile: ${error.message}`, 500);
  }
};

/**
 * List all companies for a user
 */
exports.listUserCompanies = async (req, res) => {
  try {
    console.log('📋 [Company] List user companies request received:', {
      userId: req.user.id
    });

    const companies = await Company.find({
      createdBy: req.user.id,
      isActive: true
    }).populate('organisation', 'organisationName organisationId');

    console.log('✅ [Company] User companies retrieved successfully:', companies.length);

    return successResponse(res, 'User companies retrieved successfully', {
      companies: companies.map(company => ({
        id: company._id,
        organisation: company.organisation,
        profile: company.profile,
        branding: company.branding,
        isActive: company.isActive,
        createdAt: company.createdAt
      }))
    });

  } catch (error) {
    console.error('❌ [Company] List user companies error:', error);
    return errorResponse(res, `Error retrieving user companies: ${error.message}`, 500);
  }
};

