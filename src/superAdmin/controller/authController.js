const jwt = require('jsonwebtoken');
const Superadmin = require('../model/superadmin');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const sendMail = require('../../../utils/sendMail');

// Generate 6-digit OTP
const generateOTP = () => {
   console.log('🔐 Generating OTP...');
   const otp = Math.floor(100000 + Math.random() * 900000).toString();
   console.log('✅ OTP Generated:', otp);
   return otp;
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
   console.log('📧 Sending OTP email to:', email);
   try {
      const subject = 'Your OTP for HR Portal';
      const text = `Your OTP is ${otp}. It is valid for 10 minutes.`;
      await sendMail(email, subject, text);
      console.log(`✅ OTP email sent successfully to: ${email}`);
   } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
   }
};

// Register Superadmin with OTP verification
exports.registerSuperadmin = async (req, res) => {
   console.log('🚀 [SuperAdmin] Register request received:', { email: req.body.email });
   try {
      const { email, password } = req.body;
      console.log('📝 Registration data:', { email, password: password ? '***' : 'missing' });
      
      if (!email || !password) {
         console.log('❌ Missing email or password');
         return errorResponse(res, 'Email and password are required', 400);
      }

      console.log('🔍 Checking for existing superadmin...');
      const existingSuperadmin = await Superadmin.findOne({ email });
      if (existingSuperadmin) {
         console.log('❌ Superadmin already exists:', email);
         return errorResponse(res, 'Superadmin with this email already exists', 400);
      }

      console.log('✅ No existing superadmin found, creating new one...');
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      const superadmin = new Superadmin({
         email,
         password,
         role: 'Superadmin',
         otp,
         otpExpires
      });

      console.log('💾 Saving superadmin to database...');
      await superadmin.save();
      console.log('✅ Superadmin saved successfully');
      
      console.log('📧 Sending OTP email...');
      await sendOTPEmail(email, otp, 'registration');

      console.log('✅ Registration completed successfully');
      return successResponse(res, 'Superadmin registered, OTP sent to email', {
         email,
         message: 'Please verify OTP to complete registration'
      }, 201);
   } catch (error) {
      console.error('❌ RegisterSuperadmin error:', error);
      return errorResponse(res, 'Server error during registration');
   }
};

// Verify Registration OTP
exports.verifyRegistrationOTP = async (req, res) => {
   console.log('🔐 [SuperAdmin] OTP verification request received:', { email: req.body.email });
   try {
      const { email, otp } = req.body;
      console.log('📝 OTP verification data:', { email, otp });
      
      if (!email || !otp) {
         console.log('❌ Missing email or OTP');
         return errorResponse(res, 'Email and OTP are required', 400);
      }

      console.log('🔍 Finding superadmin with OTP...');
      const superadmin = await Superadmin.findOne({
         email,
         otp,
         otpExpires: { $gt: Date.now() }
      });

      if (!superadmin) {
         console.log('❌ Invalid or expired OTP for:', email);
         return errorResponse(res, 'Invalid or expired OTP', 401);
      }

      console.log('✅ Valid OTP found, updating superadmin...');
      superadmin.isEmailVerified = true;
      superadmin.otp = undefined;
      superadmin.otpExpires = undefined;
      await superadmin.save();
      console.log('✅ Superadmin updated successfully');

      console.log('🔑 Generating JWT token...');
      const token = jwt.sign(
         { id: superadmin._id, role: superadmin.role },
         process.env.JWT_SECRET,
         { expiresIn: '1d' }
      );
      console.log('✅ JWT token generated');

      console.log('✅ OTP verification completed successfully');
      return successResponse(res, 'Email verified and registration completed', {
         token,
         superadmin: {
            id: superadmin._id,
            email: superadmin.email,
            role: superadmin.role
         }
      });
   } catch (error) {
      console.error('❌ VerifyRegistrationOTP error:', error);
      return errorResponse(res, 'Server error during OTP verification');
   }
};

// Login Superadmin
exports.loginSuperadmin = async (req, res) => {
   console.log('🔑 [SuperAdmin] Login request received:', { email: req.body.email });
   try {
      const { email, password } = req.body;
      console.log('📝 Login data:', { email, password: password  });
      
      if (!email || !password) {
         console.log('❌ Missing email or password');
         return errorResponse(res, 'Email and password are required', 400);
      }

      console.log('🔍 Finding superadmin by email...');
      const superadmin = await Superadmin.findOne({ email });
      if (!superadmin) {
         console.log('❌ Superadmin not found:', email);
         return errorResponse(res, 'Invalid credentials', 401);
      }

      console.log('🔐 Checking password...');
      const isPasswordValid = await superadmin.comparePassword(password);
      if (!isPasswordValid) {
         console.log('❌ Invalid password for:', email);
         return errorResponse(res, 'Invalid credentials', 401);
      }

      if (!superadmin.isEmailVerified) {
         console.log('❌ Email not verified for:', email);
         return errorResponse(res, 'Please verify your email first', 401);
      }

      console.log('✅ Password valid, generating token...');
      const token = jwt.sign(
         { id: superadmin._id, role: superadmin.role },
         process.env.JWT_SECRET,
         { expiresIn: '1d' }
      );
      console.log('✅ JWT token generated');

      console.log('✅ Login successful for:', email);
      return successResponse(res, 'Login successful', {
         token,
         superadmin: {
            id: superadmin._id,
            email: superadmin.email,
            role: superadmin.role
         }
      });
   } catch (error) {
      console.error('❌ LoginSuperadmin error:', error);
      return errorResponse(res, 'Server error during login');
   }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
   console.log('🔑 [SuperAdmin] Forgot password request received:', { email: req.body.email });
   try {
      const { email } = req.body;
      console.log('📝 Forgot password data:', { email });
      
      if (!email) {
         console.log('❌ Missing email');
         return errorResponse(res, 'Email is required', 400);
      }

      console.log('🔍 Finding superadmin by email...');
      const superadmin = await Superadmin.findOne({ email });
      if (!superadmin) {
         console.log('❌ Superadmin not found:', email);
         return errorResponse(res, 'If email exists, OTP will be sent', 200);
      }

      console.log('✅ Superadmin found, generating OTP...');
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      superadmin.otp = otp;
      superadmin.otpExpires = otpExpires;
      await superadmin.save();
      console.log('✅ OTP saved to database');

      console.log('📧 Sending OTP email...');
      await sendOTPEmail(email, otp);

      console.log('✅ Forgot password OTP sent successfully');
      return successResponse(res, 'If email exists, OTP will be sent', { email });
   } catch (error) {
      console.error('❌ ForgotPassword error:', error);
      return errorResponse(res, 'Server error during forgot password');
   }
};

// Reset Password
exports.resetPassword = async (req, res) => {
   console.log('🔑 [SuperAdmin] Reset password request received:', { email: req.body.email });
   try {
      const { email, otp, newPassword } = req.body;
      console.log('📝 Reset password data:', { email, otp, newPassword: newPassword ? '***' : 'missing' });
      
      if (!email || !otp || !newPassword) {
         console.log('❌ Missing required fields');
         return errorResponse(res, 'Email, OTP, and new password are required', 400);
      }

      console.log('🔍 Finding superadmin with OTP...');
      const superadmin = await Superadmin.findOne({
         email,
         otp,
         otpExpires: { $gt: Date.now() }
      });

      if (!superadmin) {
         console.log('❌ Invalid or expired OTP for:', email);
         return errorResponse(res, 'Invalid or expired OTP', 401);
      }

      console.log('✅ Valid OTP found, updating password...');
      superadmin.password = newPassword;
      superadmin.otp = undefined;
      superadmin.otpExpires = undefined;
      await superadmin.save();
      console.log('✅ Password updated successfully');

      console.log('✅ Password reset completed successfully');
      return successResponse(res, 'Password reset successful');
   } catch (error) {
      console.error('❌ ResetPassword error:', error);
      return errorResponse(res, 'Server error during password reset');
   }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
   console.log('📧 [SuperAdmin] Resend OTP request received:', { email: req.body.email });
   try {
      const { email } = req.body;
      console.log('📝 Resend OTP data:', { email });
      
      if (!email) {
         console.log('❌ Missing email');
         return errorResponse(res, 'Email is required', 400);
      }

      console.log('🔍 Finding superadmin by email...');
      const superadmin = await Superadmin.findOne({ email });
      if (!superadmin) {
         console.log('❌ Superadmin not found:', email);
         return errorResponse(res, 'If email exists, OTP will be sent', 200);
      }

      console.log('✅ Superadmin found, generating new OTP...');
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      superadmin.otp = otp;
      superadmin.otpExpires = otpExpires;
      await superadmin.save();
      console.log('✅ New OTP saved to database');

      console.log('📧 Sending new OTP email...');
      await sendOTPEmail(email, otp);

      console.log('✅ OTP resent successfully');
      return successResponse(res, 'OTP resent successfully', { email });
   } catch (error) {
      console.error('❌ ResendOTP error:', error);
      return errorResponse(res, 'Server error during OTP resend');
   }
};

// Get Superadmin Profile
exports.getProfile = async (req, res) => {
   console.log('👤 [SuperAdmin] Get profile request received:', { userId: req.user.id });
   try {
      console.log('🔍 Finding superadmin by ID...');
      const superadmin = await Superadmin.findById(req.user.id).select('-password');
      if (!superadmin) {
         console.log('❌ Superadmin not found:', req.user.id);
         return errorResponse(res, 'Superadmin not found', 404);
      }

      console.log('✅ Superadmin profile found');
      return successResponse(res, 'Profile retrieved successfully', { superadmin });
   } catch (error) {
      console.error('❌ GetProfile error:', error);
      return errorResponse(res, 'Server error while retrieving profile');
   }
};