const jwt = require('jsonwebtoken');
const Superadmin = require('../src/superAdmin/model/superadmin');
const Admin = require('../src/admin/model/admin');
const User = require('../src/user/model/user');
const { errorResponse } = require('../utils/apiResponse');

// Middleware to protect routes by verifying JWT and checking roles
const authMiddleware = (allowedRoles) => {
   return async (req, res, next) => {
      try {
         // Validate allowedRoles
         if (!Array.isArray(allowedRoles)) {
            console.error('Auth middleware: allowedRoles must be an array');
            return errorResponse(res, 'Server configuration error', 500);
         }

         // Get token from Authorization header
         const authHeader = req.header('Authorization');
         if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'No token provided or invalid format', 401);
         }

         const token = authHeader.replace('Bearer ', '');

         // Verify token
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         if (!decoded.id || !decoded.role) {
            return errorResponse(res, 'Invalid token structure', 401);
         }

         // Find user in appropriate model based on role
         let user;
         if (decoded.role === 'Superadmin') {
            user = await Superadmin.findById(decoded.id).select('-password -otp -otpExpires');
         } else if (decoded.role === 'Admin') {
            user = await Admin.findById(decoded.id).select('-password');
         } else if (decoded.role === 'User') {
            user = await User.findById(decoded.id).select('-password');
         } else {
            return errorResponse(res, 'Invalid user role', 401);
         }

         if (!user) {
            return errorResponse(res, 'User not found', 404);
         }

         // Check if user's role is in allowedRoles array
         if (!allowedRoles.includes(user.role)) {
            return errorResponse(res, 'Access denied: insufficient permissions', 403);
         }

         // Attach user to request object
         req.user = user;
         next();
      } catch (error) {
         console.error('Auth middleware error:', error);
         if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 'Token has expired', 401);
         } else if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 'Invalid token', 401);
         }
         return errorResponse(res, 'Token verification failed', 401);
      }
   };
};

module.exports = authMiddleware;