const mongoose = require('mongoose');

const generatedOfferSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  templateVersion: { type: Number, required: true },
  candidateData: {
  candidate_name: { type: String, required: true },
  candidate_email: { type: String, required: true },
    candidate_phone: { type: String },
    candidate_address: { type: String },
  designation: { type: String, required: true },
    department: { type: String },
    band_level: { type: String },
    work_location: { type: String },
    joining_date: { type: Date },
    base_salary: { type: Number },
    hra: { type: Number },
    special_allowance: { type: Number },
    statutory_bonus: { type: Number },
    gross_salary: { type: Number },
    total_ctc: { type: Number },
    contract_duration_days: { type: Number },
    contract_end_date: { type: Date },
    notice_period_days: { type: Number },
    probation_period_months: { type: Number },
    company_name: { type: String },
    company_address: { type: String },
    company_logo: { type: String },
  additional_data: mongoose.Schema.Types.Mixed
  },
  companyData: {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', required: true },
    companyName: { type: String, required: true },
    industry: { type: String },
    companyType: { type: String },
    branding: {
      logo: { type: String },
      primaryColor: { type: String },
      secondaryColor: { type: String },
      fontFamily: { type: String }
    },
    policies: {
      leavePolicy: {
        annualLeave: { type: Number },
        sickLeave: { type: Number },
        maternityLeave: { type: Number },
        paternityLeave: { type: Number }
      },
      workPolicy: {
        remoteWork: { type: Boolean },
        flexibleHours: { type: Boolean },
        dressCode: { type: String }
      },
      performancePolicy: {
        reviewCycle: { type: String },
        kpiStructure: { type: String }
      }
    },
    compliance: [{
      standard: { type: String },
      description: { type: String },
      isRequired: { type: Boolean },
      status: { type: String }
    }]
  },
  salaryBreakdown: {
    basic: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    hra: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    specialAllowance: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    statutoryBonus: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    grossSalary: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    pf: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    esic: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    professionalTax: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    netTakeHome: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    employerPf: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    employerEsic: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    gratuity: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    insurance: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    ctc: {
      annual: { type: Number },
      monthly: { type: Number }
    },
    benefits: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      value: mongoose.Schema.Types.Mixed,
      annual: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 }
    }]
  },
  renderedContent: {
    html: { type: String },
    plainText: { type: String }
  },
  metadata: {
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    organisation: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation' },
    industry: { type: String },
    companyType: { type: String },
    location: { type: String },
    currency: { type: String },
    complianceStatus: { type: String }
  },
  status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected'], default: 'draft' },
  statusHistory: [{
    status: { type: String, enum: ['draft', 'sent', 'accepted', 'rejected'] },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    comments: { type: String }
  }],
  tracking: {
    viewCount: { type: Number, default: 0 },
    sentAt: { type: Date },
    expiresAt: { type: Date },
    lastViewedAt: { type: Date }
  },
  settings: {
    allowDownload: { type: Boolean, default: true },
    allowForward: { type: Boolean, default: true },
    expiresInDays: { type: Number, default: 30 },
    requireSignature: { type: Boolean, default: false }
  },
  communication: {
    emailSentAt: { type: Date },
    lastEmailSent: {
      subject: { type: String },
      body: { type: String },
      sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date },
      messageId: { type: String }
    },
    reminders: [{
      type: { type: String },
      sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date },
      messageId: { type: String },
      customMessage: { type: String }
    }]
  },
  analytics: {
    views: [{
      viewedAt: { type: Date },
      ip: { type: String },
      userAgent: { type: String }
    }],
    downloads: [{
      downloadedAt: { type: Date },
      ip: { type: String },
      userAgent: { type: String }
    }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
generatedOfferSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
generatedOfferSchema.methods.updateStatus = async function(newStatus, changedBy, comments = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    changedBy: changedBy,
    changedAt: new Date(),
    comments: comments
  });
  
  // Update tracking based on status
  if (newStatus === 'sent') {
    this.tracking.sentAt = new Date();
    this.tracking.expiresAt = new Date(Date.now() + (this.settings.expiresInDays * 24 * 60 * 60 * 1000));
  }
  
  await this.save();
  return this;
};

generatedOfferSchema.methods.markAsViewed = async function(ip, userAgent) {
  this.tracking.viewCount = (this.tracking.viewCount || 0) + 1;
  this.tracking.lastViewedAt = new Date();
  
  // Add view tracking to analytics if it exists
  if (!this.analytics) {
    this.analytics = { views: [] };
  }
  if (!this.analytics.views) {
    this.analytics.views = [];
  }
  
  this.analytics.views.push({
    viewedAt: new Date(),
    ip: ip,
    userAgent: userAgent
  });
  
  await this.save();
  return this;
};

// Static methods for analytics
generatedOfferSchema.statics.getOfferStats = async function(organisationId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        'metadata.organisation': organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOffers: { $sum: 1 },
        acceptedOffers: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
        pendingOffers: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
        sentOffers: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
        rejectedOffers: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        totalValue: { $sum: '$salaryBreakdown.ctc.annual' },
        avgOfferValue: { $avg: '$salaryBreakdown.ctc.annual' }
      }
    }
  ]);
  
  return stats[0] || {
    totalOffers: 0,
    acceptedOffers: 0,
    pendingOffers: 0,
    sentOffers: 0,
    rejectedOffers: 0,
    totalValue: 0,
    avgOfferValue: 0
  };
};

generatedOfferSchema.statics.getDailyTrends = async function(organisationId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        'metadata.organisation': organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        value: { $sum: '$salaryBreakdown.ctc.annual' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

generatedOfferSchema.statics.getStatusDistribution = async function(organisationId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        'metadata.organisation': organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

generatedOfferSchema.statics.getTopDesignations = async function(organisationId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        'metadata.organisation': organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$candidateData.designation',
        count: { $sum: 1 },
        avgSalary: { $avg: '$salaryBreakdown.ctc.annual' },
        acceptanceRate: {
          $avg: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
};

module.exports = mongoose.model('GeneratedOffer', generatedOfferSchema);