const User = require('../../user/model/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const sendMail = require('../../../utils/sendMail');

// Login user
exports.loginUser = async (req, res) => {
   console.log('🔑 [User] Login request received:', { email: req.body.email });
   try {
      const { email, password } = req.body;
      console.log('📝 Login data:', { email, password: password ? '***' : 'missing' });

      // Validate input
      if (!email || !password) {
         console.log('❌ Missing email or password');
         return errorResponse(res, 'Email and password are required', 400);
      }

      console.log('🔍 Finding user by email...');
      // Find user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
         console.log('❌ User not found:', email);
         return errorResponse(res, 'Invalid credentials', 401);
      }
      console.log('✅ User found:', user.email);

      console.log('🔐 Checking password...');
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
         console.log('❌ Invalid password for:', email);
         return errorResponse(res, 'Invalid credentials', 401);
      }
      console.log('✅ Password valid');

      console.log('🔑 Generating JWT token...');
      // Generate JWT
      const token = jwt.sign(
         { id: user._id, role: user.role },
         process.env.JWT_SECRET || 'your_jwt_secret', // Replace with env variable in production
         { expiresIn: '1d' }
      );
      console.log('✅ JWT token generated');

      console.log('✅ Login successful for:', email);
      console.log('🔍 [UserLogin] User object being sent:', {
         _id: user._id,
         email: user.email,
         role: user.role,
         organisation: user.organisation,
         status: user.status,
         createdAt: user.createdAt
      });
      
      return successResponse(res, 'Login successful', { 
         token, 
         user: {
            _id: user._id,
            email: user.email,
            role: user.role,
            organisation: user.organisation,
            status: user.status,
            createdAt: user.createdAt
         }
      });
   } catch (error) {
      console.error('❌ LoginUser error:', error);
      return errorResponse(res, `Error logging in: ${error.message}`);
   }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
   console.log('🔑 [User] Forgot password request received:', { email: req.body.email });
   try {
      const { email } = req.body;
      console.log('📝 Forgot password data:', { email });

      // Validate input
      if (!email) {
         console.log('❌ Missing email');
         return errorResponse(res, 'Email is required', 400);
      }

      console.log('🔍 Finding user by email...');
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
         console.log('❌ User not found:', email);
         return errorResponse(res, 'User not found', 404);
      }
      console.log('✅ User found:', user.email);

      console.log('🔐 Generating reset token...');
      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
      await user.save();
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