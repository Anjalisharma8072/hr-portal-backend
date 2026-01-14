const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
   email: { type: String, required: true, unique: true, trim: true },
   password: { type: String, required: true },
   role: { type: String, default: 'Admin' },
   organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      required: true
   },
   status: { type: String, enum: ['active', 'inactive'], default: 'active' },
   createdAt: { type: Date, default: Date.now }
});

adminSchema.pre('save', async function (next) {
   if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
   }
   next();
});

adminSchema.methods.comparePassword = async function (password) {
   return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);