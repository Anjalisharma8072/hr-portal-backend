const mongoose = require('mongoose');

const organisationSchema = new mongoose.Schema({
  organisationName: { type: String, required: true, unique: true, trim: true },
  onboardDate: { type: Date, default: Date.now },
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Pending'], default: 'Pending' },
  organisationId: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Organisation', organisationSchema);