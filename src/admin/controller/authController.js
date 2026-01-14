const Admin = require('../../admin/model/admin');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const sendMail = require('../../../utils/sendMail');

// Login admin
exports.loginAdmin = async (req, res) => {
   console.log('🔑 [Admin] Login request received:', { email: req.body.email });
   try {
      const { email, password } = req.body;
      console.log('📝 Login data:', { email, password: password ? '***' : 'missing' });

      // Validate input
      if (!email || !password) {
         console.log('❌ Missing email or password');
         return errorResponse(res, 'Email and password are required', 400);
      }

      console.log('🔍 Finding admin by email...');
      // Find admin
      const admin = await Admin.findOne({ email }).select('+password');
      if (!admin) {
         console.log('❌ Admin not found:', email);
         return errorResponse(res, 'Invalid credentials', 401);
      }
      console.log('✅ Admin found:', admin.email);

      console.log('🔐 Checking password...');
      // Check password
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
         console.log('❌ Invalid password for:', email);
         return errorResponse(res, 'Invalid credentials', 401);
      }
      console.log('✅ Password valid');

      console.log('🔑 Generating JWT token...');
      // Generate JWT
      const token = jwt.sign(
         { id: admin._id, role: admin.role },
         process.env.JWT_SECRET || 'your_jwt_secret', // Replace with env variable in production
         { expiresIn: '1d' }
      );
      console.log('✅ JWT token generated');

      console.log('✅ Login successful for:', email);
      return successResponse(res, 'Login successful', { token, admin: { email: admin.email, role: admin.role } });
   } catch (error) {
      console.error('❌ LoginAdmin error:', error);
      return errorResponse(res, `Error logging in: ${error.message}`);
   }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
   console.log('🔑 [Admin] Forgot password request received:', { email: req.body.email });
   try {
      const { email } = req.body;
      console.log('📝 Forgot password data:', { email });

      // Validate input
      if (!email) {
         console.log('❌ Missing email');
         return errorResponse(res, 'Email is required', 400);
      }

      console.log('🔍 Finding admin by email...');
      // Find admin
      const admin = await Admin.findOne({ email });
      if (!admin) {
         console.log('❌ Admin not found:', email);
         return errorResponse(res, 'Admin not found', 404);
      }
      console.log('✅ Admin found:', admin.email);

      console.log('🔐 Generating reset token...');
      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      admin.resetPasswordToken = resetToken;
      admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
      await admin.save();
      console.log('✅ Reset token saved to database');

      console.log('📧 Sending reset email...');
      // Send reset email
      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
      const subject = 'HR Portal - Password Reset Request';
      const text = `You requested a password reset. Click this link to reset your password: ${resetLink}. This link expires in 1 hour.`;
      await sendMail(email, subject, text);
      console.log('✅ Reset email sent successfully');

      console.log('✅ Forgot password completed successfully');
      return successResponse(res, 'Password reset email sent successfully');
   } catch (error) {
      console.error('❌ ForgotPassword error:', error);
      return errorResponse(res, `Error sending reset email: ${error.message}`);
   }
};