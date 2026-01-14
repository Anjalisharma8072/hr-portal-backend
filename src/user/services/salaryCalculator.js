/**
 * Universal Salary Calculator Service
 * Handles salary calculations for any company type, industry, and location
 */

class SalaryCalculator {
  constructor() {
    // Default salary structures for different company types
    this.defaultStructures = {
      'startup': {
        hraPercentage: 0.1, // 10% of basic
        specialAllowancePercentage: 0.113, // 11.3% of basic
        statutoryBonusPercentage: 0.083, // 8.33% of basic
        pfPercentage: 0.12, // 12% of basic
        esicPercentage: 0.0075, // 0.75% of basic
        employerPfPercentage: 0.12, // 12% of basic
        employerEsicPercentage: 0.0325, // 3.25% of basic
        gratuityPercentage: 0.048, // 4.8% of basic
        insuranceAmount: 200, // Fixed amount
        additionalBenefits: ['ESOPs', 'Flexible hours', 'Remote work']
      },
      'corporate': {
        hraPercentage: 0.1,
        specialAllowancePercentage: 0.113,
        statutoryBonusPercentage: 0.083,
        pfPercentage: 0.12,
        esicPercentage: 0.0075,
        employerPfPercentage: 0.12,
        employerEsicPercentage: 0.0325,
        gratuityPercentage: 0.048,
        insuranceAmount: 500,
        additionalBenefits: ['Health Insurance', 'LTA', 'Professional Development']
      },
      'tech': {
        hraPercentage: 0.1,
        specialAllowancePercentage: 0.113,
        statutoryBonusPercentage: 0.083,
        pfPercentage: 0.12,
        esicPercentage: 0.0075,
        employerPfPercentage: 0.12,
        employerEsicPercentage: 0.0325,
        gratuityPercentage: 0.048,
        insuranceAmount: 300,
        additionalBenefits: ['Internet Allowance', 'Learning Budget', 'Gym Membership']
      },
      'manufacturing': {
        hraPercentage: 0.1,
        specialAllowancePercentage: 0.113,
        statutoryBonusPercentage: 0.083,
        pfPercentage: 0.12,
        esicPercentage: 0.0075,
        employerPfPercentage: 0.12,
        employerEsicPercentage: 0.0325,
        gratuityPercentage: 0.048,
        insuranceAmount: 400,
        additionalBenefits: ['Safety Equipment', 'Shift Allowance', 'Transport Allowance']
      },
      'consulting': {
        hraPercentage: 0.1,
        specialAllowancePercentage: 0.113,
        statutoryBonusPercentage: 0.083,
        pfPercentage: 0.12,
        esicPercentage: 0.0075,
        employerPfPercentage: 0.12,
        employerEsicPercentage: 0.0325,
        gratuityPercentage: 0.048,
        insuranceAmount: 350,
        additionalBenefits: ['Travel Allowance', 'Meal Allowance', 'Professional Memberships']
      }
    };

    // Industry-specific salary structures
    this.industryStructures = {
      'IT': {
        additionalAllowances: {
          'Software Licenses': 5000,
          'Conference Budget': 25000,
          'Certification Budget': 15000
        }
      },
      'Healthcare': {
        additionalAllowances: {
          'Medical Equipment': 'Company provided',
          'Professional Development': 75000,
          'Medical Insurance': 'Family coverage'
        }
      },
      'Finance': {
        additionalAllowances: {
          'Professional Memberships': 15000,
          'Market Data Access': 'Company provided',
          'Performance Bonus': 'Variable based on performance'
        }
      },
      'Education': {
        additionalAllowances: {
          'Professional Development': 50000,
          'Research Budget': 30000,
          'Conference Attendance': 20000
        }
      }
    };

    // Location-specific salary structures
    this.locationStructures = {
      'India': {
        currency: 'INR',
        professionalTax: 167, // Monthly professional tax
        taxSlabs: [
          { min: 0, max: 250000, rate: 0 },
          { min: 250001, max: 500000, rate: 0.05 },
          { min: 500001, max: 1000000, rate: 0.2 },
          { min: 1000001, max: null, rate: 0.3 }
        ]
      },
      'US': {
        currency: 'USD',
        socialSecurity: 0.062, // 6.2% up to limit
        medicare: 0.0145, // 1.45%
        federalTax: 'Progressive tax system'
      },
      'UK': {
        currency: 'GBP',
        nationalInsurance: 0.12, // 12% for employees
        pension: 0.05, // 5% minimum contribution
        incomeTax: 'Progressive tax system'
      },
      'Singapore': {
        currency: 'SGD',
        cpf: 0.2, // 20% for employees
        employerCpf: 0.17, // 17% for employers
        noCapitalGains: true
      }
    };
  }

  /**
   * Calculate salary breakdown for any company
   * @param {Object} candidateData - Candidate salary information
   * @param {Object} companyPolicy - Company-specific salary policy
   * @param {String} location - Location for tax calculations
   * @returns {Object} Complete salary breakdown
   */
  calculateSalary(candidateData, companyPolicy = {}, location = 'India') {
    try {
      const basic = candidateData.base_salary || 0;
      const companyType = companyPolicy.companyType || 'corporate';
      const industry = companyPolicy.industry || 'Other';
      
      // Get default structure for company type
      const defaultStructure = this.defaultStructures[companyType] || this.defaultStructures['corporate'];
      
      // Merge with company-specific policy
      const structure = { ...defaultStructure, ...companyPolicy.salaryStructure };
      
      // Calculate basic components
      const hra = basic * structure.hraPercentage;
      const specialAllowance = basic * structure.specialAllowancePercentage;
      const statutoryBonus = basic * structure.statutoryBonusPercentage;
      
      // Calculate gross salary
      const grossSalary = basic + hra + specialAllowance + statutoryBonus;
      
      // Calculate employee deductions
      const pf = basic * structure.pfPercentage;
      const esic = basic * structure.esicPercentage;
      const professionalTax = this.getProfessionalTax(location, basic);
      
      // Calculate net take home
      const netTakeHome = grossSalary - pf - esic - professionalTax;
      
      // Calculate employer contributions
      const employerPf = basic * structure.employerPfPercentage;
      const employerEsic = basic * structure.employerEsicPercentage;
      const gratuity = basic * structure.gratuityPercentage;
      const insurance = structure.insuranceAmount || 0;
      
      // Calculate CTC
      const ctc = grossSalary + employerPf + employerEsic + gratuity + insurance;
      
      // Calculate industry-specific benefits
      const industryBenefits = this.calculateIndustryBenefits(industry, basic, companyPolicy);
      
      // Calculate location-specific adjustments
      const locationAdjustments = this.calculateLocationAdjustments(location, basic, companyPolicy);
      
      // Build complete salary breakdown
      const salaryBreakdown = {
        basic: { annual: basic, monthly: basic / 12 },
        hra: { annual: hra, monthly: hra / 12 },
        specialAllowance: { annual: specialAllowance, monthly: specialAllowance / 12 },
        statutoryBonus: { annual: statutoryBonus, monthly: statutoryBonus / 12 },
        grossSalary: { annual: grossSalary, monthly: grossSalary / 12 },
        
        // Employee deductions
        pf: { annual: pf, monthly: pf / 12 },
        esic: { annual: esic, monthly: esic / 12 },
        professionalTax: { annual: professionalTax * 12, monthly: professionalTax },
        netTakeHome: { annual: netTakeHome, monthly: netTakeHome / 12 },
        
        // Employer contributions
        employerPf: { annual: employerPf, monthly: employerPf / 12 },
        employerEsic: { annual: employerEsic, monthly: employerEsic / 12 },
        gratuity: { annual: gratuity, monthly: gratuity / 12 },
        insurance: { annual: insurance, monthly: insurance / 12 },
        
        // Total
        ctc: { annual: ctc, monthly: ctc / 12 },
        
        // Benefits breakdown
        benefits: [
          ...this.formatBenefits(defaultStructure.additionalBenefits, 'non-monetary'),
          ...industryBenefits,
          ...locationAdjustments
        ],
        
        // Summary
        summary: {
          totalEarnings: grossSalary,
          totalDeductions: pf + esic + professionalTax,
          netTakeHome: netTakeHome,
          employerCost: ctc,
          costToCompany: ctc
        }
      };
      
      return {
        success: true,
        salaryBreakdown,
        companyType,
        industry,
        location,
        currency: this.locationStructures[location]?.currency || 'INR'
      };
      
    } catch (error) {
      console.error('Salary calculation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate industry-specific benefits
   * @param {String} industry - Industry type
   * @param {Number} basic - Basic salary
   * @param {Object} companyPolicy - Company policy
   * @returns {Array} Industry benefits
   */
  calculateIndustryBenefits(industry, basic, companyPolicy) {
    const industryStructure = this.industryStructures[industry];
    if (!industryStructure) return [];
    
    const benefits = [];
    
    Object.entries(industryStructure.additionalAllowances).forEach(([name, value]) => {
      let annualValue = value;
      let monthlyValue = value;
      
      if (typeof value === 'number') {
        annualValue = value;
        monthlyValue = value / 12;
      } else if (typeof value === 'string' && value.includes('%')) {
        const percentage = parseFloat(value.replace('%', '')) / 100;
        annualValue = basic * percentage;
        monthlyValue = annualValue / 12;
      }
      
      benefits.push({
        name,
        type: 'allowance',
        value: typeof value === 'number' ? value : 'Company provided',
        annual: annualValue,
        monthly: monthlyValue,
        description: `${name} allowance`
      });
    });
    
    return benefits;
  }

  /**
   * Calculate location-specific adjustments
   * @param {String} location - Location
   * @param {Number} basic - Basic salary
   * @param {Object} companyPolicy - Company policy
   * @returns {Array} Location adjustments
   */
  calculateLocationAdjustments(location, basic, companyPolicy) {
    const locationStructure = this.locationStructures[location];
    if (!locationStructure) return [];
    
    const adjustments = [];
    
    // Add location-specific benefits
    if (location === 'India') {
      // Add standard Indian benefits
      adjustments.push({
        name: 'LTA (Leave Travel Allowance)',
        type: 'allowance',
        value: 'As per company policy',
        annual: 0,
        monthly: 0,
        description: 'Leave Travel Allowance'
      });
      
      adjustments.push({
        name: 'Medical Reimbursement',
        type: 'allowance',
        value: 'Up to ₹15,000 annually',
        annual: 15000,
        monthly: 1250,
        description: 'Medical expense reimbursement'
      });
    }
    
    if (location === 'US') {
      adjustments.push({
        name: '401(k) Match',
        type: 'monetary',
        value: 'Company match up to 6%',
        annual: basic * 0.06,
        monthly: (basic * 0.06) / 12,
        description: '401(k) retirement plan match'
      });
    }
    
    if (location === 'UK') {
      adjustments.push({
        name: 'Pension Contribution',
        type: 'monetary',
        value: 'Minimum 5% contribution',
        annual: basic * 0.05,
        monthly: (basic * 0.05) / 12,
        description: 'Workplace pension contribution'
      });
    }
    
    return adjustments;
  }

  /**
   * Get professional tax based on location and salary
   * @param {String} location - Location
   * @param {Number} basic - Basic salary
   * @returns {Number} Professional tax amount
   */
  getProfessionalTax(location, basic) {
    if (location !== 'India') return 0;
    
    // Indian professional tax slabs (varies by state)
    // This is a simplified version - in reality, it varies by state
    if (basic <= 500000) return 167; // Monthly
    if (basic <= 1000000) return 200;
    return 250;
  }

  /**
   * Format benefits for display
   * @param {Array} benefits - Benefits array
   * @param {String} type - Benefit type
   * @returns {Array} Formatted benefits
   */
  formatBenefits(benefits, type) {
    if (!Array.isArray(benefits)) return [];
    
    return benefits.map(benefit => ({
      name: benefit,
      type,
      value: 'Company provided',
      annual: 0,
      monthly: 0,
      description: `${benefit} benefit`
    }));
  }

  /**
   * Calculate tax liability
   * @param {Number} totalIncome - Total annual income
   * @param {String} location - Location
   * @returns {Object} Tax calculation
   */
  calculateTax(totalIncome, location = 'India') {
    const locationStructure = this.locationStructures[location];
    if (!locationStructure || !locationStructure.taxSlabs) {
      return { totalTax: 0, effectiveRate: 0 };
    }
    
    let totalTax = 0;
    
    locationStructure.taxSlabs.forEach(slab => {
      if (totalIncome > slab.min) {
        const taxableAmount = slab.max ? Math.min(totalIncome - slab.min, slab.max - slab.min) : totalIncome - slab.min;
        totalTax += taxableAmount * slab.rate;
      }
    });
    
    return {
      totalTax,
      effectiveRate: totalTax / totalIncome,
      monthlyTax: totalTax / 12
    };
  }

  /**
   * Generate salary slip data
   * @param {Object} salaryBreakdown - Salary breakdown
   * @param {String} month - Month
   * @param {String} year - Year
   * @returns {Object} Salary slip data
   */
  generateSalarySlip(salaryBreakdown, month, year) {
    return {
      month,
      year,
      basic: salaryBreakdown.basic.monthly,
      hra: salaryBreakdown.hra.monthly,
      specialAllowance: salaryBreakdown.specialAllowance.monthly,
      statutoryBonus: salaryBreakdown.statutoryBonus.monthly,
      grossSalary: salaryBreakdown.grossSalary.monthly,
      pf: salaryBreakdown.pf.monthly,
      esic: salaryBreakdown.esic.monthly,
      professionalTax: salaryBreakdown.professionalTax.monthly,
      netTakeHome: salaryBreakdown.netTakeHome.monthly,
      benefits: salaryBreakdown.benefits.filter(b => b.monthly > 0)
    };
  }

  /**
   * Validate salary data
   * @param {Object} candidateData - Candidate data
   * @returns {Object} Validation result
   */
  validateSalaryData(candidateData) {
    const errors = [];
    const warnings = [];
    
    if (!candidateData.base_salary || candidateData.base_salary <= 0) {
      errors.push('Base salary is required and must be greater than 0');
    }
    
    if (candidateData.base_salary < 10000) {
      warnings.push('Base salary seems low for professional positions');
    }
    
    if (candidateData.base_salary > 10000000) {
      warnings.push('Base salary seems unusually high');
    }
    
    if (candidateData.total_ctc && candidateData.total_ctc < candidateData.base_salary) {
      errors.push('Total CTC cannot be less than base salary');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = new SalaryCalculator();
