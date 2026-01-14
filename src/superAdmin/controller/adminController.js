const Admin = require('../../admin/model/admin');
const Organisation = require('../../organisation/model/organisation');
const sendMail = require('./../../../utils/sendMail');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const User = require('../../user/model/user');

// Create a new admin
exports.createAdmin = async (req, res) => {
   console.log('👨‍💼 [SuperAdmin] Create admin request received:', { email: req.body.email, organisation: req.body.organisation });
   try {
      const { email, password, organisation } = req.body;
      console.log('📝 Create admin data:', { email, password: password ? '***' : 'missing', organisation });

      // Validate input
      if (!email || !password || !organisation) {
         console.log('❌ Missing required fields for admin creation');
         return errorResponse(res, 'Email, password, and organisation are required', 400);
      }

      console.log('🔍 Checking if organisation exists...');
      // Check if organisation exists
      const org = await Organisation.findById(organisation);
      if (!org) {
         console.log('❌ Organisation not found:', organisation);
         return errorResponse(res, 'Invalid organisation', 400);
      }
      console.log('✅ Organisation found:', org.name);

      console.log('🔍 Checking if admin already exists...');
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
         console.log('❌ Admin already exists:', email);
         return errorResponse(res, 'Admin with this email already exists', 400);
      }
      console.log('✅ No existing admin found');

      console.log('💾 Creating new admin...');
      // Create new admin
      const admin = new Admin({ email, password, organisation });
      await admin.save();
      console.log('✅ Admin created successfully');

      console.log('📧 Sending welcome email...');
      // Send reset password email
      const resetLink = 'http://localhost:3000/reset-password'; // Placeholder; replace with actual reset token logic
      const subject = 'Welcome to HR Portal - Set Your Password';
      const text = `You have been added as an admin. Please set your password using this link: ${resetLink}`;
      await sendMail(email, subject, text);
      console.log('✅ Welcome email sent successfully');

      console.log('✅ Admin creation completed successfully');
      return successResponse(res, 'Admin created successfully and email sent', { admin }, 201);
   } catch (error) {
      console.error('❌ CreateAdmin error:', error);
      return errorResponse(res, `Error creating admin: ${error.message}`);
   }
};

// Fetch all admins for an organisation
exports.getAdminsByOrganisation = async (req, res) => {
   console.log('👥 [SuperAdmin] Get admins by organisation request received:', { orgId: req.params.orgId });
   try {
      const { orgId } = req.params;
      console.log('📝 Organisation ID:', orgId);

      console.log('🔍 Validating organisation...');
      // Validate organisation
      const org = await Organisation.findById(orgId);
      if (!org) {
         console.log('❌ Organisation not found:', orgId);
         return errorResponse(res, 'Invalid organisation', 400);
      }
      console.log('✅ Organisation found:', org.name);

      console.log('🔍 Fetching admins for organisation...');
      // Fetch admins
      const admins = await Admin.find({ organisation: orgId }).select('-password');
      console.log('✅ Found', admins.length, 'admins');

      console.log('✅ Admins fetched successfully');
      return successResponse(res, 'Admins fetched successfully', { admins });
   } catch (error) {
      console.error('❌ GetAdminsByOrganisation error:', error);
      return errorResponse(res, `Error fetching admins: ${error.message}`);
   }
};

// Fetch all admins across all organisations (for SuperAdmin dashboard)
exports.getAllAdmins = async (req, res) => {
   console.log('👥 [SuperAdmin] Get all admins request received');
   try {
      console.log('🔍 Fetching all admins...');
      // Fetch all admins, excluding password, and populate organisation details
      const admins = await Admin.find({}).select('-password').populate('organisation', 'name');
      console.log('✅ Found', admins.length, 'admins');

      console.log('✅ All admins fetched successfully');
      return successResponse(res, 'All admins fetched successfully', { admins });
   } catch (error) {
      console.error('❌ GetAllAdmins error:', error);
      return errorResponse(res, `Error fetching all admins: ${error.message}`);
   }
};

// Fetch details of a specific admin
exports.getAdminDetails = async (req, res) => {
   console.log('👤 [SuperAdmin] Get admin details request received:', { adminId: req.params.adminId });
   try {
      const { adminId } = req.params;
      console.log('📝 Admin ID:', adminId);

      console.log('🔍 Fetching admin details...');
      // Fetch admin details, excluding password
      const admin = await Admin.findById(adminId).select('-password').populate('organisation', 'name');
      if (!admin) {
         console.log('❌ Admin not found:', adminId);
         return errorResponse(res, 'Admin not found', 404);
      }
      console.log('✅ Admin found:', admin.email);

      console.log('✅ Admin details fetched successfully');
      return successResponse(res, 'Admin details fetched successfully', { admin });
   } catch (error) {
      console.error('❌ GetAdminDetails error:', error);
      return errorResponse(res, `Error fetching admin details: ${error.message}`);
   }
};

// Update an admin
exports.updateAdmin = async (req, res) => {
   console.log('✏️ [SuperAdmin] Update admin request received:', { adminId: req.params.adminId });
   try {
      const { adminId } = req.params;
      const { email, password, organisation } = req.body;
      console.log('📝 Update admin data:', { adminId, email, password: password ? '***' : 'missing', organisation });

      // Validate input
      if (!email && !password && !organisation) {
         console.log('❌ No fields provided for update');
         return errorResponse(res, 'At least one field (email, password, organisation) is required', 400);
      }

      console.log('🔍 Checking if admin exists...');
      // Check if admin exists
      const admin = await Admin.findById(adminId);
      if (!admin) {
         console.log('❌ Admin not found:', adminId);
         return errorResponse(res, 'Admin not found', 404);
      }
      console.log('✅ Admin found:', admin.email);

      // Check if organisation exists (if provided)
      if (organisation) {
         console.log('🔍 Validating new organisation...');
         const org = await Organisation.findById(organisation);
         if (!org) {
            console.log('❌ Organisation not found:', organisation);
            return errorResponse(res, 'Invalid organisation', 400);
         }
         console.log('✅ Organisation validated:', org.name);
      }

      console.log('💾 Updating admin...');
      // Update fields
      if (email) admin.email = email;
      if (password) admin.password = password;
      if (organisation) admin.organisation = organisation;

      await admin.save();
      console.log('✅ Admin updated successfully');

      console.log('✅ Admin update completed successfully');
      return successResponse(res, 'Admin updated successfully', { admin });
   } catch (error) {
      console.error('❌ UpdateAdmin error:', error);
      return errorResponse(res, `Error updating admin: ${error.message}`);
   }
};

// Delete an admin
exports.deleteAdmin = async (req, res) => {
   console.log('🗑️ [SuperAdmin] Delete admin request received:', { adminId: req.params.adminId });
   try {
      const { adminId } = req.params;
      console.log('📝 Admin ID to delete:', adminId);

      console.log('🔍 Checking if admin exists...');
      // Check if admin exists
      const admin = await Admin.findById(adminId);
      if (!admin) {
         console.log('❌ Admin not found:', adminId);
         return errorResponse(res, 'Admin not found', 404);
      }
      console.log('✅ Admin found:', admin.email);

      console.log('🗑️ Deleting admin...');
      // Delete admin
      await Admin.findByIdAndDelete(adminId);
      console.log('✅ Admin deleted successfully');

      console.log('✅ Admin deletion completed successfully');
      return successResponse(res, 'Admin deleted successfully');
   } catch (error) {
      console.error('❌ DeleteAdmin error:', error);
      return errorResponse(res, `Error deleting admin: ${error.message}`);
   }
};

// Toggle admin status
exports.toggleAdminStatus = async (req, res) => {
   console.log('🔄 [SuperAdmin] Toggle admin status request received:', { adminId: req.params.adminId });
   try {
      const { adminId } = req.params;
      console.log('📝 Admin ID to toggle:', adminId);

      console.log('🔍 Finding admin...');
      // Find admin
      const admin = await Admin.findById(adminId);
      if (!admin) {
         console.log('❌ Admin not found:', adminId);
         return errorResponse(res, 'Admin not found', 404);
      }
      console.log('✅ Admin found:', admin.email, 'Current status:', admin.isActive);

      console.log('🔄 Toggling admin status...');
      // Toggle status
      admin.isActive = !admin.isActive;
      await admin.save();
      console.log('✅ Admin status updated to:', admin.isActive);

      console.log('✅ Admin status toggle completed successfully');
      return successResponse(res, 'Admin status updated successfully', { 
         admin: {
            id: admin._id,
            email: admin.email,
            isActive: admin.isActive
         }
      });
   } catch (error) {
      console.error('❌ ToggleAdminStatus error:', error);
      return errorResponse(res, `Error toggling admin status: ${error.message}`);
   }
};


