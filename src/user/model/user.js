const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   email: { type: String, required: true, unique: true, trim: true },
   password: { type: String, required: true },
   role: { type: String, default: 'User' },
   organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true
   },
   status: { type: String, enum: ['active', 'inactive'], default: 'active' },
   createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
   if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
   }
   next();
});

userSchema.methods.comparePassword = async function (password) {
   return await bcrypt.compare(password, this.password);
};

// Static methods for analytics
userSchema.statics.getUserStats = async function(organisationId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        organisation: organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        newUsers: { $sum: 1 }
      }
    }
  ]);
  
  return stats[0] || { totalUsers: 0, activeUsers: 0, newUsers: 0 };
};

userSchema.statics.getUserGrowthTrends = async function(organisationId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        organisation: organisationId,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

userSchema.statics.getRoleDistribution = async function(organisationId) {
  return await this.aggregate([
    {
      $match: { organisation: organisationId }
    },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema);