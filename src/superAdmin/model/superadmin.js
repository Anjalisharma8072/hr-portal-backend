const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const superadminSchema = new mongoose.Schema({
   email: { type: String, required: true, unique: true, trim: true },
   password: { type: String, required: true },
   role: { type: String, default: 'Superadmin' },
   otp: { type: String },
   otpExpires: { type: Date },
   isEmailVerified: { type: Boolean, default: false },
   createdAt: { type: Date, default: Date.now }
});

superadminSchema.pre('save', async function (next) {
   if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
   }
   next();
});

superadminSchema.methods.comparePassword = async function (password) {
   return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Superadmin', superadminSchema);



