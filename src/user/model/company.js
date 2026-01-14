const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  industry: { 
    type: String, 
    enum: ['IT', 'Manufacturing', 'Healthcare', 'Finance', 'Education', 'Retail', 'Consulting', 'Real Estate', 'Automotive', 'Telecommunications', 'Other'], 
    default: 'Other' 
  },
  companyType: { 
    type: String, 
    enum: ['startup', 'corporate', 'consulting', 'manufacturing', 'tech', 'custom'], 
    default: 'corporate' 
  },
  employeeCount: { 
    type: String, 
    enum: ['1-50', '51-200', '201-500', '501-1000', '1000+'], 
    default: '1-50' 
  },
  foundedYear: { type: Number, min: 1900, max: new Date().getFullYear() },
  website: { type: String, trim: true },
  description: { type: String, trim: true },
  
  // Enhanced address with validation
  address: {
    street: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },
    pincode: { type: String, trim: true },
    timezone: { type: String, default: 'Asia/Kolkata' }
  },
  
  // Enhanced contact info
  contactInfo: {
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    hrEmail: { type: String, trim: true, lowercase: true }
  },
  
  // Business details
  businessDetails: {
    panNumber: { type: String, trim: true, uppercase: true },
    gstNumber: { type: String, trim: true, uppercase: true },
    tanNumber: { type: String, trim: true, uppercase: true },
    cinNumber: { type: String, trim: true, uppercase: true },
    registrationNumber: { type: String, trim: true }
  },
  
  // Company status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  }
});

const companyBrandingSchema = new mongoose.Schema({
  logo: { type: String, trim: true },
  primaryColor: { type: String, default: '#2563eb' },
  secondaryColor: { type: String, default: '#64748b' },
  fontFamily: { type: String, default: 'Arial, sans-serif' },
  headerStyle: { 
    type: String, 
    enum: ['modern', 'professional', 'centered', 'minimal'], 
    default: 'centered' 
  },
  footerStyle: { 
    type: String, 
    enum: ['simple', 'detailed', 'minimal'], 
    default: 'simple' 
  },
  customCSS: { type: String, trim: true },
  
  // Additional branding fields
  tagline: { type: String, trim: true },
  brandGuidelines: { type: String, trim: true },
  colorPalette: [String]
});

const salaryStructureSchema = new mongoose.Schema({
  // Basic salary components
  hraPercentage: { type: Number, default: 0.1, min: 0, max: 1 },
  specialAllowancePercentage: { type: Number, default: 0.113, min: 0, max: 1 },
  statutoryBonusPercentage: { type: Number, default: 0.083, min: 0, max: 1 },
  
  // Statutory deductions
  pfPercentage: { type: Number, default: 0.12, min: 0, max: 1 },
  esicPercentage: { type: Number, default: 0.0325, min: 0, max: 1 },
  gratuityPercentage: { type: Number, default: 0.048, min: 0, max: 1 },
  professionalTax: { type: Number, default: 2400, min: 0 },
  
  // Additional components
  conveyanceAllowance: { type: Number, default: 1600, min: 0 },
  medicalAllowance: { type: Number, default: 1250, min: 0 },
  foodAllowance: { type: Number, default: 0, min: 0 },
  
  // Salary structure settings
  salaryStructureType: {
    type: String,
    enum: ['cost_to_company', 'gross_salary', 'take_home'],
    default: 'cost_to_company'
  }
});

const employmentTermsSchema = new mongoose.Schema({
  // Probation and notice
  probationPeriod: { type: Number, default: 6, min: 0, max: 24 },
  noticePeriod: { type: Number, default: 30, min: 0, max: 90 },
  contractDuration: { type: Number, default: 365, min: 30, max: 3650 },
  
  // Working conditions
  workingHours: { type: String, default: '9 AM - 6 PM' },
  workDays: { type: String, default: 'Monday - Friday' },
  overtimePolicy: { type: String, default: 'As per company policy' },
  
  // Additional terms
  bondPeriod: { type: Number, default: 0, min: 0 },
  bondAmount: { type: Number, default: 0, min: 0 },
  trainingPeriod: { type: Number, default: 0, min: 0 },
  
  // Work arrangements
  workMode: {
    type: String,
    enum: ['onsite', 'hybrid', 'remote', 'flexible'],
    default: 'onsite'
  },
  workLocation: { type: String, trim: true }
});

const benefitSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    enum: ['monetary', 'non-monetary', 'insurance', 'allowance', 'equity', 'other'], 
    default: 'allowance' 
  },
  value: mongoose.Schema.Types.Mixed,
  isMandatory: { type: Boolean, default: false },
  description: { type: String, trim: true },
  
  // Financial values
  annualValue: { type: Number, default: 0, min: 0 },
  monthlyValue: { type: Number, default: 0, min: 0 },
  
  // Benefit details
  eligibilityCriteria: { type: String, trim: true },
  waitingPeriod: { type: Number, default: 0, min: 0 }, // in months
  maxCoverage: { type: Number, default: 0, min: 0 },
  
  // Status
  isActive: { type: Boolean, default: true }
});

const companySchema = new mongoose.Schema({
  // Reference to the multi-vendor organisation
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    required: true
  },
  
  // Company profile information
  profile: companyProfileSchema,
  
  // Branding and visual identity
  branding: companyBrandingSchema,
  
  // Salary structure defaults
  salaryStructure: salaryStructureSchema,
  
  // Employment terms
  employmentTerms: employmentTermsSchema,
  
  // Benefits and perks
  benefits: [benefitSchema],
  
  // Company policies
  policies: {
    leavePolicy: {
      annualLeave: { type: Number, default: 20, min: 0, max: 365 },
      sickLeave: { type: Number, default: 10, min: 0, max: 365 },
      maternityLeave: { type: Number, default: 26, min: 0, max: 365 },
      paternityLeave: { type: Number, default: 10, min: 0, max: 365 },
      otherLeave: { type: Number, default: 5, min: 0, max: 365 },
      casualLeave: { type: Number, default: 7, min: 0, max: 365 },
      compensatoryOff: { type: Number, default: 0, min: 0, max: 365 }
    },
    workPolicy: {
      remoteWork: { type: Boolean, default: false },
      flexibleHours: { type: Boolean, default: false },
      dressCode: { 
        type: String, 
        enum: ['Casual', 'Business Casual', 'Formal', 'Smart Casual'], 
        default: 'Business Casual' 
      },
      workFromHome: { type: Boolean, default: false },
      travelPolicy: { type: String, trim: true }
    },
    performancePolicy: {
      reviewCycle: { 
        type: String, 
        enum: ['Monthly', 'Quarterly', 'Bi-annual', 'Annual'], 
        default: 'Quarterly' 
      },
      kpiStructure: { type: String, trim: true },
      bonusCriteria: { type: String, trim: true },
      promotionPolicy: { type: String, trim: true }
    }
  },
  
  // Settings and preferences
  settings: {
    useCompanyBranding: { type: Boolean, default: true },
    allowCustomization: { type: Boolean, default: true },
    autoApplyCompanyPolicies: { type: Boolean, default: true },
    defaultCurrency: { type: String, default: 'INR' },
    defaultLocation: { type: String, default: 'India' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    language: { type: String, default: 'en' }
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: { type: Boolean, default: true },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Additional metadata
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDate: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Pre-save middleware to set default benefits based on company type
companySchema.pre('save', function(next) {
  if (this.isNew || this.isModified('profile.companyType')) {
    this.setDefaultBenefits();
  }
  next();
});

// Instance methods
companySchema.methods.setDefaultBenefits = function() {
  if (!this.benefits || this.benefits.length === 0) {
    const defaults = [];
    
    if (this.profile.companyType === 'startup') {
      defaults.push({ 
        name: 'ESOPs', 
        type: 'equity', 
        value: '0.1% - 0.5%', 
        isMandatory: false, 
        description: 'Employee Stock Option Plan',
        annualValue: 0,
        monthlyValue: 0,
        eligibilityCriteria: 'After 1 year of service',
        waitingPeriod: 12
      });
      defaults.push({ 
        name: 'Flexible Hours', 
        type: 'non-monetary', 
        value: true, 
        isMandatory: false, 
        description: 'Flexible working hours',
        annualValue: 0,
        monthlyValue: 0
      });
      defaults.push({ 
        name: 'Remote Work', 
        type: 'non-monetary', 
        value: true, 
        isMandatory: false, 
        description: 'Work from anywhere option',
        annualValue: 0,
        monthlyValue: 0
      });
    } else if (this.profile.companyType === 'corporate') {
      defaults.push({ 
        name: 'Health Insurance', 
        type: 'insurance', 
        value: 'Family coverage', 
        isMandatory: true, 
        description: 'Comprehensive health insurance',
        annualValue: 15000,
        monthlyValue: 1250,
        maxCoverage: 500000
      });
      defaults.push({ 
        name: 'Provident Fund', 
        type: 'monetary', 
        value: '12% of basic', 
        isMandatory: true, 
        description: 'Employee provident fund',
        annualValue: 0,
        monthlyValue: 0
      });
      defaults.push({
        name: 'Gratuity',
        type: 'monetary',
        value: '15 days per year',
        isMandatory: true,
        description: 'Statutory gratuity benefit',
        annualValue: 0,
        monthlyValue: 0
      });
    }
    
    this.benefits = defaults;
  }
};

companySchema.methods.getIndustryBenefits = function() {
  return this.benefits?.filter(b => b.isActive) || [];
};

companySchema.methods.isCompliant = function() {
  // Check if company has basic required documents
  const hasBasicDocs = this.profile.businessDetails.panNumber && 
                      this.profile.businessDetails.gstNumber;
  return hasBasicDocs;
};

companySchema.methods.getCompanySummary = function() {
  return {
    id: this._id,
    name: this.profile.companyName,
    industry: this.profile.industry,
    type: this.profile.companyType,
    status: this.profile.status,
    employeeCount: this.profile.employeeCount,
    location: `${this.profile.address.city}, ${this.profile.address.state}`,
    isActive: this.isActive
  };
};

// Static methods
companySchema.statics.findByOrganisation = function(organisationId) {
  return this.find({ organisation: organisationId, isActive: true });
};

companySchema.statics.findByIndustry = function(industry) {
  return this.find({ 'profile.industry': industry, isActive: true });
};

companySchema.statics.findByCompanyType = function(companyType) {
  return this.find({ 'profile.companyType': companyType, isActive: true });
};

companySchema.statics.findByStatus = function(status) {
  return this.find({ 'profile.status': status, isActive: true });
};

// Indexes for better performance
companySchema.index({ organisation: 1, isActive: 1 });
companySchema.index({ 'profile.industry': 1, 'profile.companyType': 1 });
companySchema.index({ 'profile.status': 1 });
companySchema.index({ createdBy: 1 });
companySchema.index({ 'profile.companyName': 'text', 'profile.description': 'text' });
companySchema.index({ 'profile.businessDetails.panNumber': 1 });
companySchema.index({ 'profile.businessDetails.gstNumber': 1 });

// Static methods for analytics
companySchema.statics.getCompanyStats = async function(organisationId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        organisation: organisationId,
        isActive: true,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalCompanies: { $sum: 1 },
        activeCompanies: { $sum: 1 },
        verifiedCompanies: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'verified'] }, 1, 0] } },
        pendingVerification: { $sum: { $cond: [{ $eq: ['$verificationStatus', 'pending'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || { 
    totalCompanies: 0, 
    activeCompanies: 0, 
    verifiedCompanies: 0, 
    pendingVerification: 0 
  };
};

companySchema.statics.getIndustryDistribution = async function(organisationId) {
  return await this.aggregate([
    {
      $match: {
        organisation: organisationId,
        isActive: true
      }
    },
    {
      $group: {
        _id: '$profile.industry',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

companySchema.statics.getCompanyTypeDistribution = async function(organisationId) {
  return await this.aggregate([
    {
      $match: {
        organisation: organisationId,
        isActive: true
      }
    },
    {
      $group: {
        _id: '$profile.companyType',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

companySchema.statics.getVerificationStats = async function(organisationId) {
  return await this.aggregate([
    {
      $match: {
        organisation: organisationId,
        isActive: true
      }
    },
    {
      $group: {
        _id: '$verificationStatus',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Company', companySchema);

