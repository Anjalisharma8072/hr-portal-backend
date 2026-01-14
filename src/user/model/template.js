const mongoose = require('mongoose');

const placeholderSchema = new mongoose.Schema({
  key: { type: String, required: true }, // {{candidate_name}}
  label: { type: String, required: true }, // "Candidate Name"
  type: { 
    type: String, 
    enum: ['text', 'number', 'date', 'currency', 'dropdown', 'calculated', 'company', 'industry'],
    default: 'text'
  },
  required: { type: Boolean, default: false },
  defaultValue: String,
  description: String,
  validation: {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String,
    format: String
  },
  options: [String], // For dropdown type
  formula: String, // For calculated type
  dependencies: [String], // For calculated type
  category: { 
    type: String, 
    enum: ['candidate', 'job', 'salary', 'company', 'legal', 'industry', 'benefits'],
    default: 'candidate'
  },
  // Company-specific placeholder configuration
  companySpecific: {
    applicableIndustries: [String], // Which industries this placeholder applies to
    applicableCompanyTypes: [String], // Which company types this applies to
    isIndustryStandard: { type: Boolean, default: false }, // Is this a standard industry placeholder
    conditionalDisplay: {
      field: String, // Field to check for conditional display
      value: mongoose.Schema.Types.Mixed, // Value to compare against
      operator: { type: String, enum: ['==', '!=', '>', '<', '>=', '<=', 'in', 'not_in'], default: '==' }
    }
  }
});

const conditionalSectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  condition: {
    field: { type: String, required: true }, // designation, department, etc.
    operator: { 
      type: String, 
      enum: ['==', '!=', '>', '>=', '<', '<=', 'in', 'not_in'],
      default: '=='
    },
    value: mongoose.Schema.Types.Mixed, // Can be string, number, or array
    logicalOperator: { type: String, enum: ['AND', 'OR'], default: 'AND' }
  },
  content: { type: String, required: true },
  isVisible: { type: Boolean, default: true },
  priority: { type: Number, default: 1 },
  // Company-specific conditional logic
  companyConditions: [{
    field: String, // company.industry, company.type, etc.
    operator: String,
    value: mongoose.Schema.Types.Mixed
  }]
});

const contentBlockSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['text', 'placeholder', 'break', 'image', 'company_logo', 'company_branding'],
    required: true 
  },
  text: String, // For text blocks
  key: String, // For placeholder blocks
  formatting: {
    fontWeight: { 
      type: String, 
      enum: ['normal', 'bold', 'bolder', 'lighter'],
      default: 'normal'
    },
    fontSize: String,
    color: String,
    textAlign: { 
      type: String, 
      enum: ['left', 'center', 'right', 'justify'],
      default: 'left'
    },
    textDecoration: { 
      type: String, 
      enum: ['none', 'underline', 'line-through'],
      default: 'none'
    },
    fontStyle: { 
      type: String, 
      enum: ['normal', 'italic'],
      default: 'normal'
    },
    backgroundColor: String,
    border: String,
    padding: String,
    margin: String
  },
  // Company branding integration
  companyBranding: {
    useCompanyColors: { type: Boolean, default: true },
    useCompanyFont: { type: Boolean, default: true },
    customStyling: String
  }
});

const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['header', 'paragraph', 'table', 'list', 'rich_text', 'conditional', 'salary_table', 'document_list', 'company_info', 'benefits_table', 'terms_conditions', 'compliance_section'],
    required: true 
  },
  title: String, // For section headers
  content: mongoose.Schema.Types.Mixed, // Flexible content based on type
  blocks: [contentBlockSchema], // For rich_text type
  formatting: {
    fontWeight: String,
    fontSize: String,
    color: String,
    textAlign: String,
    textDecoration: String,
    fontStyle: String
  },
  styling: {
    fontSize: String,
    lineHeight: String,
    marginTop: String,
    marginBottom: String,
    marginLeft: String,
    marginRight: String,
    padding: String,
    backgroundColor: String,
    border: String,
    borderRadius: String,
    boxShadow: String
  },
  placeholders: [placeholderSchema],
  conditionalSections: [conditionalSectionSchema],
  metadata: {
    isRequired: { type: Boolean, default: true },
    isEditable: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    // Company-specific section metadata
    applicableIndustries: [String],
    applicableCompanyTypes: [String],
    isIndustryStandard: { type: Boolean, default: false }
  }
});

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  
  // Template categorization for universal company support
  category: { 
    type: String, 
    enum: ['standard', 'executive', 'contract', 'internship', 'custom', 'industry_standard', 'company_specific'],
    default: 'standard'
  },
  industry: {
    type: String,
    enum: ['IT', 'Manufacturing', 'Healthcare', 'Finance', 'Education', 'Retail', 'Consulting', 'Real Estate', 'Automotive', 'Telecommunications', 'Other', 'Universal'],
    default: 'Universal'
  },
  companyType: {
    type: String,
    enum: ['startup', 'corporate', 'consulting', 'manufacturing', 'tech', 'custom', 'universal'],
    default: 'universal'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    required: true
  },
  designation: String,
  salaryStructureType: { 
    type: String, 
    enum: ['Fixed', 'Variable', 'Hybrid', 'Commission-based', 'Project-based', 'Equity-heavy'],
    default: 'Fixed'
  },
  
  // Company branding integration
  companyBranding: {
    useCompanyLogo: { type: Boolean, default: true },
    useCompanyColors: { type: Boolean, default: true },
    useCompanyFont: { type: Boolean, default: true },
    customBranding: {
      logo: String,
      primaryColor: String,
      secondaryColor: String,
      fontFamily: String
    }
  },
  
  // Content structure
  content: {
    sections: [sectionSchema],
    placeholders: [placeholderSchema],
    conditionalSections: [conditionalSectionSchema],
    globalStyling: {
      fontFamily: { type: String, default: 'Arial, sans-serif' },
      fontSize: { type: String, default: '14px' },
      lineHeight: { type: String, default: '1.6' },
      color: { type: String, default: '#333333' },
      backgroundColor: { type: String, default: '#ffffff' }
    }
  },
  
  // Template metadata
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [String],
    estimatedCompletionTime: Number, // in minutes
    complexity: { 
      type: String, 
      enum: ['simple', 'medium', 'complex'],
      default: 'medium'
    },
    // Universal company support metadata
    isIndustryTemplate: { type: Boolean, default: false },
    isCompanySpecific: { type: Boolean, default: false },
    supportedLocations: [String], // ['India', 'US', 'UK', 'Singapore']
    supportedCurrencies: [String], // ['INR', 'USD', 'GBP', 'SGD']
    complianceStandards: [String], // ['ISO', 'SOC', 'GDPR', 'HIPAA']
    industryCompliance: [{
      standard: String,
      description: String,
      isRequired: Boolean
    }]
  },
  
  // Version control
  versionHistory: [{
    version: Number,
    content: mongoose.Schema.Types.Mixed,
    changes: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: { type: Date, default: Date.now }
  }],
  
  // Template settings
  settings: {
    allowDuplication: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    autoSave: { type: Boolean, default: true },
    saveInterval: { type: Number, default: 30000 }, // 30 seconds
    maxVersions: { type: Number, default: 10 },
    // Universal company settings
    allowCompanyCustomization: { type: Boolean, default: true },
    allowIndustryCustomization: { type: Boolean, default: true },
    requireCompanyReview: { type: Boolean, default: false },
    autoApplyCompanyBranding: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Indexes for better performance
templateSchema.index({ organisation: 1, isActive: 1 });
templateSchema.index({ 'metadata.createdBy': 1 });
templateSchema.index({ category: 1, department: 1 });
templateSchema.index({ industry: 1, companyType: 1 });
templateSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to handle versioning
templateSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Increment version
    this.version += 1;
    
    // Add to version history
    this.versionHistory.push({
      version: this.version,
      content: this.content,
      changes: 'Content updated',
      modifiedBy: this.metadata.lastModifiedBy || this.metadata.createdBy,
      modifiedAt: new Date()
    });
    
    // Keep only max versions
    if (this.versionHistory.length > this.settings.maxVersions) {
      this.versionHistory = this.versionHistory.slice(-this.settings.maxVersions);
    }
  }
  next();
});

// Instance methods
templateSchema.methods.duplicate = function(newName, newCreator) {
  const duplicate = new this.constructor({
    ...this.toObject(),
    _id: undefined,
    name: newName,
    version: 1,
    versionHistory: [],
    metadata: {
      ...this.metadata,
      createdBy: newCreator,
      lastModifiedBy: newCreator
    },
    createdAt: undefined,
    updatedAt: undefined
  });
  
  return duplicate;
};

templateSchema.methods.validateContent = function() {
  const errors = [];
  
  // Validate required placeholders
  this.content.placeholders.forEach(placeholder => {
    if (placeholder.required && !placeholder.defaultValue) {
      errors.push(`Required placeholder ${placeholder.key} has no default value`);
    }
  });
  
  // Validate sections
  this.content.sections.forEach(section => {
    if (section.metadata.isRequired && !section.content && !section.blocks) {
      errors.push(`Required section ${section.id} has no content`);
    }
  });
  
  return errors;
};

// Static methods
templateSchema.statics.findByOrganisation = function(organisationId) {
  return this.find({ 
    'metadata.organisation': organisationId, 
    isActive: true 
  }).sort({ createdAt: -1 });
};

templateSchema.statics.findByCreator = function(userId) {
  return this.find({ 
    'metadata.createdBy': userId, 
    isActive: true 
  }).sort({ updatedAt: -1 });
};

// New static methods for universal company support
templateSchema.statics.findByIndustry = function(industry) {
  return this.find({ 
    industry: { $in: [industry, 'Universal'] },
    isActive: true 
  }).sort({ createdAt: -1 });
};

templateSchema.statics.findByCompanyType = function(companyType) {
  return this.find({ 
    companyType: { $in: [companyType, 'universal'] },
    isActive: true 
  }).sort({ createdAt: -1 });
};

templateSchema.statics.findIndustryTemplates = function() {
  return this.find({ 
    'metadata.isIndustryTemplate': true,
    isActive: true 
  }).sort({ industry: 1, createdAt: -1 });
};

templateSchema.statics.findCompanySpecificTemplates = function(organisationId) {
  return this.find({ 
    'metadata.organisation': organisationId,
    'metadata.isCompanySpecific': true,
    isActive: true 
  }).sort({ createdAt: -1 });
};

// Instance method to check if template is applicable for a company
templateSchema.methods.isApplicableForCompany = function(company) {
  // Check industry compatibility
  if (this.industry !== 'Universal' && this.industry !== company.companyInfo?.industry) {
    return false;
  }
  
  // Check company type compatibility
  if (this.companyType !== 'universal' && this.companyType !== company.companyInfo?.companyType) {
    return false;
  }
  
  return true;
};

// Instance method to get company-specific placeholders
templateSchema.methods.getCompanyPlaceholders = function(company) {
  const companyPlaceholders = [];
  
  this.content.placeholders.forEach(placeholder => {
    if (placeholder.companySpecific) {
      const applicableIndustries = placeholder.companySpecific.applicableIndustries;
      const applicableCompanyTypes = placeholder.companySpecific.applicableCompanyTypes;
      
      if (applicableIndustries.length === 0 || applicableIndustries.includes(company.companyInfo?.industry)) {
        if (applicableCompanyTypes.length === 0 || applicableCompanyTypes.includes(company.companyInfo?.companyType)) {
          companyPlaceholders.push(placeholder);
        }
      }
    }
  });
  
  return companyPlaceholders;
};

// Static methods for analytics
templateSchema.statics.getTemplateStats = async function(organisationId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        'metadata.organisation': organisationId,
        isActive: true,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalTemplates: { $sum: 1 },
        activeTemplates: { $sum: 1 }
      }
    }
  ]);
  
  return stats[0] || { totalTemplates: 0, activeTemplates: 0 };
};

templateSchema.statics.getTemplateUsageStats = async function(organisationId, startDate, endDate) {
  return await this.aggregate([
    {
      $lookup: {
        from: 'generatedoffers',
        localField: '_id',
        foreignField: 'templateId',
        as: 'offers'
      }
    },
    {
      $match: {
        'metadata.organisation': organisationId,
        isActive: true
      }
    },
    {
      $project: {
        name: 1,
        category: 1,
        usageCount: { $size: '$offers' },
        lastUsed: { $max: '$offers.createdAt' }
      }
    },
    { $sort: { usageCount: -1 } }
  ]);
};

templateSchema.statics.getCategoryPerformance = async function(organisationId) {
  return await this.aggregate([
    {
      $lookup: {
        from: 'generatedoffers',
        localField: '_id',
        foreignField: 'templateId',
        as: 'offers'
      }
    },
    {
      $match: {
        'metadata.organisation': organisationId,
        isActive: true
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalUsage: { $sum: { $size: '$offers' } }
      }
    }
  ]);
};

module.exports = mongoose.model('Template', templateSchema);