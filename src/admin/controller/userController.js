const User = require('../../user/model/user');
const Admin = require('./../../admin/model/admin');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const sendMail = require('../../../utils/sendMail');
const xlsx = require('xlsx');
const crypto = require('crypto');

// Get dashboard data for admin
exports.getDashboardData = async (req, res) => {
   console.log('📊 [Admin] Get dashboard data request received:', { adminId: req.user.id });
   try {
      const adminId = req.user.id;
      console.log('📝 Admin ID:', adminId);

      console.log('🔍 Getting admin details...');
      // Get admin's organisation with populated organisation data
      const admin = await Admin.findById(adminId).populate('organisation', 'organisationName');
      if (!admin) {
         console.log('❌ Admin not found:', adminId);
         return errorResponse(res, 'Admin not found', 404);
      }
      const organisation = admin.organisation;
      console.log('✅ Admin found, organisation:', organisation);

      console.log('🔍 Fetching dashboard statistics...');
      
      // Get total users count
      const totalUsers = await User.countDocuments({ organisation: organisation._id });
      console.log('✅ Total users count:', totalUsers);

      // Get active users count
      const activeUsers = await User.countDocuments({ 
         organisation: organisation._id, 
         status: 'active'
      });
      console.log('✅ Active users count:', activeUsers);

      // Get inactive users count
      const inactiveUsers = await User.countDocuments({ 
         organisation: organisation._id, 
         status: 'inactive'
      });
      console.log('✅ Inactive users count:', inactiveUsers);

      // Get users created in the last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentUsers = await User.countDocuments({
         organisation: organisation._id,
         createdAt: { $gte: weekAgo }
      });
      console.log('✅ Recent users count (last 7 days):', recentUsers);

      // Get 5 most recent users for the recent users list
      const recentUsersList = await User.find({ organisation: organisation._id })
         .select('-password')
         .sort({ createdAt: -1 })
         .limit(5)
         .lean();
      console.log('✅ Recent users list fetched, count:', recentUsersList.length);

      // Calculate additional statistics
      const stats = {
         totalUsers,
         activeUsers,
         inactiveUsers,
         recentUsers,
         userGrowthRate: totalUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(1) : 0,
         activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0
      };

      console.log('📊 Dashboard statistics calculated:', stats);

      // Prepare dashboard data
      const dashboardData = {
         statistics: stats,
         recentUsers: recentUsersList.map(user => ({
            _id: user._id,
            email: user.email,
            status: user.status,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin || null
         })),
         organisation: {
            id: organisation._id,
            name: organisation.organisationName || 'Unknown Organisation'
         },
         admin: {
            id: admin._id,
            email: admin.email,
            role: admin.role
         }
      };

      console.log('✅ Dashboard data prepared successfully');
      return successResponse(res, 'Dashboard data fetched successfully', dashboardData);

   } catch (error) {
      console.error('❌ GetDashboardData error:', error);
      return errorResponse(res, `Error fetching dashboard data: ${error.message}`);
   }
};

// Create a new user
exports.createUser = async (req, res) => {
   console.log('👤 [Admin] Create user request received:', { email: req.body.email, adminId: req.user.id });
   try {
      const { email, password } = req.body;
      const adminId = req.user.id; // From authMiddleware
      console.log('📝 Create user data:', { email, password: password ? '***' : 'missing', adminId });

      // Validate input
      if (!email || !password) {
         console.log('❌ Missing email or password');
         return errorResponse(res, 'Email and password are required', 400);
      }

      console.log('🔍 Getting admin details...');
      // Get admin's organisation
      const admin = await Admin.findById(adminId);
      if (!admin) {
         console.log('❌ Admin not found:', adminId);
         return errorResponse(res, 'Admin not found', 404);
      }
      const organisation = admin.organisation;
      console.log('✅ Admin found, organisation:', organisation);

      console.log('🔍 Checking if user already exists...');
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
         console.log('❌ User already exists:', email);
         return errorResponse(res, 'User with this email already exists', 400);
      }
      console.log('✅ No existing user found');

      console.log('💾 Creating new user...');
      // Create new user
      const user = new User({ email, password, organisation });
      await user.save();
      console.log('✅ User created successfully');

      console.log('📧 Sending welcome email...');
      // Send reset password email
      const resetLink = 'http://localhost:3000/reset-password'; // Placeholder; replace with actual reset token logic
      const subject = 'Welcome to HR Portal - Set Your Password';
      const text = `You have been added as a user. Please set your password using this link: ${resetLink}`;
      await sendMail(email, subject, text);
      console.log('✅ Welcome email sent successfully');

      console.log('✅ User creation completed successfully');
      return successResponse(res, 'User created successfully and email sent', { user }, 201);
   } catch (error) {
      console.error('❌ CreateUser error:', error);
      return errorResponse(res, `Error creating user: ${error.message}`);
   }
};

// Fetch all users for the admin's organisation
exports.getUsersByOrganisation = async (req, res) => {
   console.log('👥 [Admin] Get users by organisation request received:', { adminId: req.user.id });
   try {
      const adminId = req.user.id;
      console.log('📝 Admin ID:', adminId);

      console.log('🔍 Getting admin details...');
      // Get admin's organisation
      const admin = await Admin.findById(adminId);
      if (!admin) {
         console.log('❌ Admin not found:', adminId);
         return errorResponse(res, 'Admin not found', 404);
      }
      const organisation = admin.organisation;
      console.log('✅ Admin found, organisation:', organisation);

      console.log('🔍 Fetching users for organisation...');
      // Fetch users
      const users = await User.find({ organisation }).select('-password');
      console.log('✅ Found', users.length, 'users');

      console.log('✅ Users fetched successfully');
      return successResponse(res, 'Users fetched successfully', { users });
   } catch (error) {
      console.error('❌ GetUsersByOrganisation error:', error);
      return errorResponse(res, `Error fetching users: ${error.message}`);
   }
};

// Fetch details of a specific user
exports.getUserDetails = async (req, res) => {
   console.log('👤 [Admin] Get user details request received:', { userId: req.params.userId, adminId: req.user.id });
   try {
      const { userId } = req.params;
      const adminId = req.user.id;
      console.log('📝 User ID:', userId, 'Admin ID:', adminId);

      console.log('🔍 Getting admin details...');
      // Verify admin's organisation
      const admin = await Admin.findById(adminId);
      if (!admin) {
         console.log('❌ Admin not found:', adminId);
         return errorResponse(res, 'Admin not found', 404);
      }
      console.log('✅ Admin found, organisation:', admin.organisation);

      console.log('🔍 Fetching user details...');
      // Fetch user details, ensuring they belong to the admin's organisation
      const user = await User.findOne({ _id: userId, organisation: admin.organisation })
         .select('-password')
         .populate('organisation', 'name');
      if (!user) {
         console.log('❌ User not found or not in organisation:', userId);
         return errorResponse(res, 'User not found or not in your organisation', 404);
      }
      console.log('✅ User found:', user.email);

      console.log('✅ User details fetched successfully');
      return successResponse(res, 'User details fetched successfully', { user });
   } catch (error) {
      console.error('❌ GetUserDetails error:', error);
      return errorResponse(res, `Error fetching user details: ${error.message}`);
   }
};

exports.toggleUserStatus = async (req, res) => {
   console.log('🔄 [Admin] Toggle user status request received:', { userId: req.params.userId, adminId: req.user.id });
   try {
      const { userId } = req.params;
      const adminId = req.user.id;
      console.log('📝 User ID to toggle:', userId, 'Admin ID:', adminId);

      console.log('🔍 Getting admin details...');
      const admin = await Admin.findById(adminId);
      if (!admin) {
         console.log('❌ Admin not found:', adminId);
         return errorResponse(res, 'Admin not found', 404);
      }
      console.log('✅ Admin found');

      console.log('🔍 Finding user...');
      // Find user in admin's organisation
      const user = await User.findOne({ _id: userId, organisation: admin.organisation });
      if (!user) {
         console.log('❌ User not found or not in organisation:', userId);
         return errorResponse(res, 'User not found or not in your organisation', 404);
      }
      console.log('✅ User found:', user.email, 'Current status:', user.status);

      console.log('🔄 Toggling user status...');
      // Toggle status
      user.status = user.status === 'active' ? 'inactive' : 'active';
      await user.save();
      console.log('✅ User status updated to:', user.status);

      console.log('✅ User status toggle completed successfully');
      return successResponse(res, 'User status updated successfully', { 
         user: {
            id: user._id,
            email: user.email,
            status: user.status
         }
      });
   } catch (error) {
      console.error('❌ ToggleUserStatus error:', error);
      return errorResponse(res, `Error toggling user status: ${error.message}`);
   }
};

// Bulk create users from Excel file
exports.bulkCreateUsers = async (req, res) => {
   console.log('📊 [Admin] Bulk create users request received:', { adminId: req.user.id });
   try {
      const adminId = req.user.id;
      console.log('📝 Admin ID:', adminId);

      if (!req.file) {
         console.log('❌ No file uploaded');
         return errorResponse(res, 'Please upload an Excel file', 400);
      }
      console.log('✅ File uploaded:', req.file.originalname);

      console.log('🔍 Getting admin details...');
      // Get admin's organisation
      const admin = await Admin.findById(adminId);
      if (!admin) {
         console.log('❌ Admin not found:', adminId);
         return errorResponse(res, 'Admin not found', 404);
      }
      const organisation = admin.organisation;
      console.log('✅ Admin found, organisation:', organisation);

      console.log('📖 Reading Excel file...');
      // Read Excel file
      const workbook = xlsx.read(req.file.buffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      console.log('✅ Excel data parsed, rows:', data.length);

      console.log('💾 Creating users...');
      const createdUsers = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
         const row = data[i];
         const email = row.email || row.Email || row.EMAIL;
         const password = row.password || row.Password || row.PASSWORD || 'defaultPassword123';

         if (!email) {
            errors.push(`Row ${i + 1}: Email is required`);
            continue;
         }

         try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
               errors.push(`Row ${i + 1}: User with email ${email} already exists`);
               continue;
            }

            // Create user
            const user = new User({ email, password, organisation });
            await user.save();
            createdUsers.push({ email, id: user._id });

            // Send welcome email
            const resetLink = 'http://localhost:3000/reset-password';
            const subject = 'Welcome to HR Portal - Set Your Password';
            const text = `You have been added as a user. Please set your password using this link: ${resetLink}`;
            await sendMail(email, subject, text);

         } catch (error) {
            errors.push(`Row ${i + 1}: ${error.message}`);
         }
      }

      console.log('✅ Bulk creation completed. Created:', createdUsers.length, 'Errors:', errors.length);

      return successResponse(res, 'Bulk user creation completed', {
         createdUsers,
         errors,
         totalProcessed: data.length,
         successCount: createdUsers.length,
         errorCount: errors.length
      });
   } catch (error) {
      console.error('❌ BulkCreateUsers error:', error);
      return errorResponse(res, `Error in bulk user creation: ${error.message}`);
   }
};

// Search users with filters and pagination
exports.searchUsers = async (req, res) => {
   console.log('🔍 [Admin] Search users request received:', { 
      query: req.query, 
      adminId: req.user.id 
   });
   try {
      const adminId = req.user.id;
      const { 
         search = '', 
         status = 'all', 
         page = 1, 
         limit = 10,
         sortBy = 'createdAt',
         sortOrder = 'desc'
      } = req.query;
      
      console.log('📝 Search parameters:', { search, status, page, limit, sortBy, sortOrder });

      console.log('🔍 Getting admin details...');
      // Get admin's organisation
      const admin = await Admin.findById(adminId);
      if (!admin) {
         console.log('❌ Admin not found:', adminId);
         return errorResponse(res, 'Admin not found', 404);
      }
      const organisation = admin.organisation;
      console.log('✅ Admin found, organisation:', organisation);

      // Build search query
      const searchQuery = { organisation };
      
      // Add search filter for email
      if (search && search.trim()) {
         searchQuery.email = { $regex: search.trim(), $options: 'i' };
      }
      
      // Add status filter
      if (status && status !== 'all') {
         searchQuery.status = status;
      }

      console.log('🔍 Building search query:', searchQuery);

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      console.log('📊 Pagination settings:', { skip, limit: parseInt(limit), sortOptions });

      // Execute search with pagination
      const [users, totalUsers] = await Promise.all([
         User.find(searchQuery)
            .select('-password')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
         User.countDocuments(searchQuery)
      ]);

      console.log('✅ Search completed. Found:', users.length, 'Total:', totalUsers);

      // Calculate pagination info
      const totalPages = Math.ceil(totalUsers / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const searchResults = {
         users,
         pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalUsers,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
         },
         filters: {
            search: search.trim(),
            status,
            sortBy,
            sortOrder
         }
      };

      console.log('✅ Search results prepared successfully',searchResults);
      return successResponse(res, 'Users search completed successfully', searchResults);

   } catch (error) {
      console.error('❌ SearchUsers error:', error);
      return errorResponse(res, `Error searching users: ${error.message}`);
   }
};

