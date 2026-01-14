/**
 * Sample data for Universal Company Support
 * Demonstrates different company types, industries, and configurations
 */

// Sample company configurations for different types
const companySamples = {
  // Startup Company Example
  startup: {
    organisationName: 'TechStartup Inc',
    companyInfo: {
      industry: 'IT',
      companyType: 'startup',
      employeeCount: '1-50',
      foundedYear: 2023,
      website: 'https://techstartup.com',
      description: 'Innovative AI-powered SaaS startup'
    },
    branding: {
      logo: 'https://example.com/startup-logo.png',
      primaryColor: '#FF6B6B',
      secondaryColor: '#4ECDC4',
      fontFamily: 'Inter, sans-serif',
      headerStyle: 'modern',
      footerStyle: 'minimal'
    },
    offerLetterDefaults: {
      defaultSalaryStructure: {
        hraPercentage: 0.1,
        specialAllowancePercentage: 0.113,
        statutoryBonusPercentage: 0.083,
        pfPercentage: 0.12,
        esicPercentage: 0.0075,
        gratuityPercentage: 0.048
      },
      defaultTerms: {
        probationPeriod: 3,
        noticePeriod: 15,
        contractDuration: 365,
        workingHours: 'Flexible',
        workDays: 'Monday - Friday (Remote friendly)'
      },
      defaultBenefits: [
        {
          name: 'ESOPs',
          type: 'equity',
          value: '0.1% - 0.5% based on role',
          isMandatory: false,
          description: 'Employee Stock Option Plan'
        },
        {
          name: 'Flexible Hours',
          type: 'non-monetary',
          value: true,
          isMandatory: false,
          description: 'Flexible working hours'
        },
        {
          name: 'Remote Work',
          type: 'non-monetary',
          value: true,
          isMandatory: false,
          description: 'Work from anywhere option'
        }
      ]
    },
    policies: {
      leavePolicy: {
        annualLeave: 25,
        sickLeave: 12,
        maternityLeave: 26,
        paternityLeave: 15,
        otherLeave: 5
      },
      workPolicy: {
        remoteWork: true,
        flexibleHours: true,
        dressCode: 'Casual',
        overtimePolicy: 'Flexible'
      },
      performancePolicy: {
        reviewCycle: 'Quarterly',
        kpiStructure: 'OKR based',
        bonusCriteria: 'Performance + Company growth'
      }
    }
  },

  // Corporate Company Example
  corporate: {
    organisationName: 'GlobalCorp Solutions',
    companyInfo: {
      industry: 'Consulting',
      companyType: 'corporate',
      employeeCount: '1000+',
      foundedYear: 1995,
      website: 'https://globalcorp.com',
      description: 'Global consulting and technology services'
    },
    branding: {
      logo: 'https://example.com/corporate-logo.png',
      primaryColor: '#2C3E50',
      secondaryColor: '#3498DB',
      fontFamily: 'Roboto, sans-serif',
      headerStyle: 'professional',
      footerStyle: 'formal'
    },
    offerLetterDefaults: {
      defaultSalaryStructure: {
        hraPercentage: 0.1,
        specialAllowancePercentage: 0.113,
        statutoryBonusPercentage: 0.083,
        pfPercentage: 0.12,
        esicPercentage: 0.0075,
        gratuityPercentage: 0.048
      },
      defaultTerms: {
        probationPeriod: 6,
        noticePeriod: 60,
        contractDuration: 1095,
        workingHours: '9 AM - 6 PM',
        workDays: 'Monday - Friday'
      },
      defaultBenefits: [
        {
          name: 'Health Insurance',
          type: 'insurance',
          value: 'Family coverage up to ₹10L',
          isMandatory: true,
          description: 'Comprehensive health insurance'
        },
        {
          name: 'Provident Fund',
          type: 'monetary',
          value: '12% of basic + 12% employer',
          isMandatory: true,
          description: 'Employee provident fund'
        },
        {
          name: 'Gratuity',
          type: 'monetary',
          value: 'As per Gratuity Act',
          isMandatory: true,
          description: 'Gratuity benefit'
        },
        {
          name: 'LTA',
          type: 'allowance',
          value: '₹25,000 annually',
          isMandatory: false,
          description: 'Leave Travel Allowance'
        }
      ]
    },
    policies: {
      leavePolicy: {
        annualLeave: 20,
        sickLeave: 10,
        maternityLeave: 26,
        paternityLeave: 15,
        otherLeave: 3
      },
      workPolicy: {
        remoteWork: false,
        flexibleHours: false,
        dressCode: 'Business Casual',
        overtimePolicy: 'Compensatory off'
      },
      performancePolicy: {
        reviewCycle: 'Annual',
        kpiStructure: 'Balanced Scorecard',
        bonusCriteria: 'Individual + Team performance'
      }
    }
  },

  // Tech Company Example
  tech: {
    organisationName: 'InnovateTech Solutions',
    companyInfo: {
      industry: 'IT',
      companyType: 'tech',
      employeeCount: '201-500',
      foundedYear: 2010,
      website: 'https://innovatetech.com',
      description: 'Cutting-edge technology solutions provider'
    },
    branding: {
      logo: 'https://example.com/tech-logo.png',
      primaryColor: '#8E44AD',
      secondaryColor: '#E74C3C',
      fontFamily: 'Poppins, sans-serif',
      headerStyle: 'innovative',
      footerStyle: 'dynamic'
    },
    offerLetterDefaults: {
      defaultSalaryStructure: {
        hraPercentage: 0.1,
        specialAllowancePercentage: 0.113,
        statutoryBonusPercentage: 0.083,
        pfPercentage: 0.12,
        esicPercentage: 0.0075,
        gratuityPercentage: 0.048
      },
      defaultTerms: {
        probationPeriod: 3,
        noticePeriod: 30,
        contractDuration: 730,
        workingHours: 'Flexible core hours',
        workDays: 'Monday - Friday (Hybrid)'
      },
      defaultBenefits: [
        {
          name: 'Health Insurance',
          type: 'insurance',
          value: 'Family coverage + Dental',
          isMandatory: true,
          description: 'Health insurance coverage'
        },
        {
          name: 'Internet Allowance',
          type: 'allowance',
          value: 1500,
          isMandatory: false,
          description: 'Monthly internet allowance'
        },
        {
          name: 'Learning Budget',
          type: 'allowance',
          value: 75000,
          isMandatory: false,
          description: 'Annual learning and development budget'
        },
        {
          name: 'Gym Membership',
          type: 'allowance',
          value: 2500,
          isMandatory: false,
          description: 'Monthly gym membership'
        }
      ]
    },
    policies: {
      leavePolicy: {
        annualLeave: 22,
        sickLeave: 12,
        maternityLeave: 26,
        paternityLeave: 20,
        otherLeave: 5
      },
      workPolicy: {
        remoteWork: true,
        flexibleHours: true,
        dressCode: 'Smart Casual',
        overtimePolicy: 'Flexible'
      },
      performancePolicy: {
        reviewCycle: 'Semi-annual',
        kpiStructure: 'Agile metrics',
        bonusCriteria: 'Innovation + Delivery'
      }
    }
  },

  // Manufacturing Company Example
  manufacturing: {
    organisationName: 'Precision Manufacturing Ltd',
    companyInfo: {
      industry: 'Manufacturing',
      companyType: 'manufacturing',
      employeeCount: '501-1000',
      foundedYear: 1985,
      website: 'https://precisionmfg.com',
      description: 'Precision engineering and manufacturing'
    },
    branding: {
      logo: 'https://example.com/manufacturing-logo.png',
      primaryColor: '#E67E22',
      secondaryColor: '#F39C12',
      fontFamily: 'Open Sans, sans-serif',
      headerStyle: 'industrial',
      footerStyle: 'robust'
    },
    offerLetterDefaults: {
      defaultSalaryStructure: {
        hraPercentage: 0.1,
        specialAllowancePercentage: 0.113,
        statutoryBonusPercentage: 0.083,
        pfPercentage: 0.12,
        esicPercentage: 0.0075,
        gratuityPercentage: 0.048
      },
      defaultTerms: {
        probationPeriod: 6,
        noticePeriod: 45,
        contractDuration: 1095,
        workingHours: '8 AM - 5 PM',
        workDays: 'Monday - Saturday (6 days)'
      },
      defaultBenefits: [
        {
          name: 'Health Insurance',
          type: 'insurance',
          value: 'Family coverage + Accident',
          isMandatory: true,
          description: 'Health insurance coverage'
        },
        {
          name: 'Safety Equipment',
          type: 'non-monetary',
          value: 'Company provided',
          isMandatory: true,
          description: 'Safety equipment and gear'
        },
        {
          name: 'Shift Allowance',
          type: 'allowance',
          value: '₹500 per night shift',
          isMandatory: false,
          description: 'Additional allowance for night shifts'
        },
        {
          name: 'Transport Allowance',
          type: 'allowance',
          value: 2000,
          isMandatory: false,
          description: 'Monthly transport allowance'
        }
      ]
    },
    policies: {
      leavePolicy: {
        annualLeave: 18,
        sickLeave: 8,
        maternityLeave: 26,
        paternityLeave: 15,
        otherLeave: 2
      },
      workPolicy: {
        remoteWork: false,
        flexibleHours: false,
        dressCode: 'Safety gear required',
        overtimePolicy: 'Overtime pay'
      },
      performancePolicy: {
        reviewCycle: 'Annual',
        kpiStructure: 'Production metrics',
        bonusCriteria: 'Quality + Efficiency'
      }
    }
  }
};

// Sample industry-specific compliance requirements
const industryCompliance = {
  'IT': [
    {
      name: 'ISO 27001',
      description: 'Information Security Management System',
      isRequired: true,
      applicableFor: ['all']
    },
    {
      name: 'SOC 2',
      description: 'Service Organization Control 2',
      isRequired: false,
      applicableFor: ['senior', 'technical']
    },
    {
      name: 'GDPR',
      description: 'General Data Protection Regulation',
      isRequired: true,
      applicableFor: ['all']
    }
  ],
  'Healthcare': [
    {
      name: 'HIPAA',
      description: 'Health Insurance Portability and Accountability Act',
      isRequired: true,
      applicableFor: ['all']
    },
    {
      name: 'ISO 13485',
      description: 'Medical Devices Quality Management',
      isRequired: false,
      applicableFor: ['technical', 'quality']
    },
    {
      name: 'FDA Compliance',
      description: 'Food and Drug Administration Standards',
      isRequired: true,
      applicableFor: ['all']
    }
  ],
  'Finance': [
    {
      name: 'SOX',
      description: 'Sarbanes-Oxley Act Compliance',
      isRequired: true,
      applicableFor: ['all']
    },
    {
      name: 'PCI DSS',
      description: 'Payment Card Industry Data Security Standard',
      isRequired: false,
      applicableFor: ['technical', 'compliance']
    },
    {
      name: 'Basel III',
      description: 'Banking Regulation Standards',
      isRequired: false,
      applicableFor: ['senior', 'risk']
    }
  ],
  'Manufacturing': [
    {
      name: 'ISO 9001',
      description: 'Quality Management System',
      isRequired: true,
      applicableFor: ['all']
    },
    {
      name: 'ISO 14001',
      description: 'Environmental Management System',
      isRequired: false,
      applicableFor: ['management', 'environmental']
    },
    {
      name: 'OHSAS 18001',
      description: 'Occupational Health and Safety Management',
      isRequired: false,
      applicableFor: ['management', 'safety']
    }
  ]
};

// Sample universal templates for different industries
const universalTemplates = {
  'IT': [
    {
      name: 'IT Professional Standard Offer',
      description: 'Standard offer letter for IT professionals',
      category: 'industry_standard',
      industry: 'IT',
      companyType: 'universal',
      salaryStructureType: 'Fixed',
      metadata: {
        isIndustryTemplate: true,
        isCompanySpecific: false,
        supportedLocations: ['India', 'US', 'UK', 'Singapore'],
        supportedCurrencies: ['INR', 'USD', 'GBP', 'SGD'],
        complianceStandards: ['ISO 27001', 'GDPR'],
        complexity: 'medium'
      }
    }
  ],
  'Manufacturing': [
    {
      name: 'Manufacturing Professional Offer',
      description: 'Standard offer letter for manufacturing roles',
      category: 'industry_standard',
      industry: 'Manufacturing',
      companyType: 'universal',
      salaryStructureType: 'Fixed',
      metadata: {
        isIndustryTemplate: true,
        isCompanySpecific: false,
        supportedLocations: ['India', 'US', 'UK', 'Germany'],
        supportedCurrencies: ['INR', 'USD', 'GBP', 'EUR'],
        complianceStandards: ['ISO 9001', 'ISO 14001'],
        complexity: 'medium'
      }
    }
  ],
  'Healthcare': [
    {
      name: 'Healthcare Professional Offer',
      description: 'Standard offer letter for healthcare roles',
      category: 'industry_standard',
      industry: 'Healthcare',
      companyType: 'universal',
      salaryStructureType: 'Fixed',
      metadata: {
        isIndustryTemplate: true,
        isCompanySpecific: false,
        supportedLocations: ['India', 'US', 'UK', 'Canada'],
        supportedCurrencies: ['INR', 'USD', 'GBP', 'CAD'],
        complianceStandards: ['HIPAA', 'FDA'],
        complexity: 'complex'
      }
    }
  ]
};

module.exports = {
  companySamples,
  industryCompliance,
  universalTemplates
};
