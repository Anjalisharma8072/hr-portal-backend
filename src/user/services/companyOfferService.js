const Company = require('../model/company');
const Template = require('../model/template');
const GeneratedOffer = require('../model/generatedOffer');
const templateEngine = require('./templateEngine');

/**
 * Company Offer Generation Service
 * Handles offer generation with company-specific data, branding, and policies
 */
class CompanyOfferService {
  constructor() {
    this.salaryCalculator = require('./salaryCalculator');
  }

  /**
   * Generate offer with company-specific data
   */
  async generateCompanyOffer(templateId, candidateData, userId, companyId, settings = {}) {
    try {
      console.log('🏢 [CompanyOfferService] Generating company offer:', {
        templateId,
        companyId,
        candidateName: candidateData.candidate_name
      });

      // Get company data
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      // Get template
      const template = await Template.findById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Calculate salary breakdown using company structure
      const salaryBreakdown = await this.calculateSalaryBreakdown(candidateData, company);

      // Generate offer using template engine
      const result = await templateEngine.generateOffer(templateId, candidateData, userId, company);

      // Enhance offer with company data
      const enhancedOffer = await this.enhanceOfferWithCompanyData(
        result.offer,
        company,
        salaryBreakdown,
        settings
      );

      console.log('✅ [CompanyOfferService] Company offer generated successfully');
      return enhancedOffer;

    } catch (error) {
      console.error('❌ [CompanyOfferService] Error generating company offer:', error);
      throw error;
    }
  }

  /**
   * Calculate salary breakdown using company structure
   */
  async calculateSalaryBreakdown(candidateData, company) {
    try {
      const baseSalary = parseFloat(candidateData.base_salary);
      const totalCtc = parseFloat(candidateData.total_ctc);

      // Use company salary structure percentages
      const salaryStructure = company.salaryStructure || {};
      
      const hraPercentage = salaryStructure.hraPercentage || 0.1;
      const specialAllowancePercentage = salaryStructure.specialAllowancePercentage || 0.113;
      const statutoryBonusPercentage = salaryStructure.statutoryBonusPercentage || 0.083;
      const pfPercentage = salaryStructure.pfPercentage || 0.12;
      const esicPercentage = salaryStructure.esicPercentage || 0.0075;
      const gratuityPercentage = salaryStructure.gratuityPercentage || 0.048;

      // Calculate components
      const hra = baseSalary * hraPercentage;
      const specialAllowance = baseSalary * specialAllowancePercentage;
      const statutoryBonus = baseSalary * statutoryBonusPercentage;
      const pf = baseSalary * pfPercentage;
      const esic = baseSalary * esicPercentage;
      const gratuity = baseSalary * gratuityPercentage;

      // Calculate gross salary
      const grossSalary = baseSalary + hra + specialAllowance + statutoryBonus;

      // Calculate net take home
      const netTakeHome = grossSalary - pf - esic;

      // Calculate employer contributions
      const employerPf = baseSalary * pfPercentage;
      const employerEsic = baseSalary * esicPercentage;

      // Calculate total CTC
      const calculatedCtc = grossSalary + employerPf + employerEsic + gratuity;

      return {
        basic: {
          annual: baseSalary * 12,
          monthly: baseSalary
        },
        hra: {
          annual: hra * 12,
          monthly: hra
        },
        specialAllowance: {
          annual: specialAllowance * 12,
          monthly: specialAllowance
        },
        statutoryBonus: {
          annual: statutoryBonus * 12,
          monthly: statutoryBonus
        },
        grossSalary: {
          annual: grossSalary * 12,
          monthly: grossSalary
        },
        pf: {
          annual: pf * 12,
          monthly: pf
        },
        esic: {
          annual: esic * 12,
          monthly: esic
        },
        professionalTax: {
          annual: 2400, // Standard professional tax
          monthly: 200
        },
        netTakeHome: {
          annual: netTakeHome * 12,
          monthly: netTakeHome
        },
        employerPf: {
          annual: employerPf * 12,
          monthly: employerPf
        },
        employerEsic: {
          annual: employerEsic * 12,
          monthly: employerEsic
        },
        gratuity: {
          annual: gratuity * 12,
          monthly: gratuity
        },
        insurance: {
          annual: 0, // Will be calculated based on company benefits
          monthly: 0
        },
        ctc: {
          annual: calculatedCtc * 12,
          monthly: calculatedCtc
        },
        benefits: company.benefits || []
      };

    } catch (error) {
      console.error('❌ [CompanyOfferService] Error calculating salary breakdown:', error);
      throw error;
    }
  }

  /**
   * Enhance offer with company data
   */
  async enhanceOfferWithCompanyData(offer, company, salaryBreakdown, settings) {
    try {
      // Add company data
      offer.companyData = {
        companyId: company._id,
        companyName: company.companyName,
        industry: company.industry,
        companyType: company.companyType,
        location: company.location,
        branding: company.branding,
        policies: company.policies
      };

      // Add salary breakdown
      offer.salaryBreakdown = salaryBreakdown;

      // Apply company branding if enabled
      if (settings.useCompanyBranding !== false) {
        offer.renderedContent.companyBranding = {
          logo: company.branding?.logo,
          primaryColor: company.branding?.primaryColor,
          secondaryColor: company.branding?.secondaryColor,
          fontFamily: company.branding?.fontFamily,
          headerStyle: company.branding?.headerStyle,
          footerStyle: company.branding?.footerStyle,
          customCSS: company.branding?.customCSS
        };
      }

      // Apply company policies if enabled
      if (settings.autoApplyCompanyPolicies !== false) {
        offer.employmentTerms = {
          ...offer.employmentTerms,
          probationPeriod: company.employmentTerms?.probationPeriod || 6,
          noticePeriod: company.employmentTerms?.noticePeriod || 30,
          contractDuration: company.employmentTerms?.contractDuration || 365,
          workingHours: company.employmentTerms?.workingHours || '9 AM - 6 PM',
          workDays: company.employmentTerms?.workDays || 'Monday - Friday'
        };
      }

      // Add compliance information
      if (company.compliance) {
        offer.compliance = company.compliance;
      }

      // Save enhanced offer
      await offer.save();

      return offer;

    } catch (error) {
      console.error('❌ [CompanyOfferService] Error enhancing offer with company data:', error);
      throw error;
    }
  }

  /**
   * Validate offer against company policies
   */
  async validateOfferCompliance(offer, company) {
    try {
      const complianceChecks = [];

      // Check salary compliance
      if (company.policies?.salaryPolicy) {
        const salaryPolicy = company.policies.salaryPolicy;
        
        if (salaryPolicy.minBaseSalary && offer.salaryBreakdown.basic.monthly < salaryPolicy.minBaseSalary) {
          complianceChecks.push({
            type: 'salary',
            status: 'warning',
            message: `Base salary (${offer.salaryBreakdown.basic.monthly}) is below company minimum (${salaryPolicy.minBaseSalary})`
          });
        }
      }

      // Check leave policy compliance
      if (company.policies?.leavePolicy) {
        const leavePolicy = company.policies.leavePolicy;
        
        if (offer.employmentTerms?.probationPeriod > leavePolicy.maxProbationPeriod) {
          complianceChecks.push({
            type: 'leave',
            status: 'error',
            message: `Probation period (${offer.employmentTerms.probationPeriod} months) exceeds company maximum (${leavePolicy.maxProbationPeriod} months)`
          });
        }
      }

      // Check work policy compliance
      if (company.policies?.workPolicy) {
        const workPolicy = company.policies.workPolicy;
        
        if (!workPolicy.allowRemoteWork && offer.employmentTerms?.workLocation === 'Remote') {
          complianceChecks.push({
            type: 'work',
            status: 'error',
            message: 'Remote work not allowed by company policy'
          });
        }
      }

      return {
        isCompliant: complianceChecks.every(check => check.status !== 'error'),
        checks: complianceChecks,
        score: this.calculateComplianceScore(complianceChecks)
      };

    } catch (error) {
      console.error('❌ [CompanyOfferService] Error validating offer compliance:', error);
      throw error;
    }
  }

  /**
   * Calculate compliance score
   */
  calculateComplianceScore(complianceChecks) {
    if (complianceChecks.length === 0) return 100;

    const totalChecks = complianceChecks.length;
    const errorChecks = complianceChecks.filter(check => check.status === 'error').length;
    const warningChecks = complianceChecks.filter(check => check.status === 'warning').length;

    const errorPenalty = errorChecks * 30; // Each error reduces score by 30
    const warningPenalty = warningChecks * 10; // Each warning reduces score by 10

    const score = Math.max(0, 100 - errorPenalty - warningPenalty);
    return Math.round(score);
  }

  /**
   * Get company-specific templates
   */
  async getCompanyTemplates(companyId, filters = {}) {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      const query = {
        isActive: true,
        $or: [
          { industry: company.industry },
          { industry: 'Universal' },
          { companyType: company.companyType },
          { companyType: 'universal' }
        ]
      };

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.department) {
        query.department = filters.department;
      }

      const templates = await Template.find(query).sort({ createdAt: -1 });
      return templates;

    } catch (error) {
      console.error('❌ [CompanyOfferService] Error getting company templates:', error);
      throw error;
    }
  }
}

module.exports = new CompanyOfferService();
