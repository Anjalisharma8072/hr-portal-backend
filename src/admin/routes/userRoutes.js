const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../../../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Debug: Log userController to verify exports
console.log('userController:', userController);
console.log('Loaded userController from:', require.resolve('../controller/userController'));

// Dashboard route
router.get('/dashboard', authMiddleware(['Admin']), userController.getDashboardData);

// User management routes
router.post('/createUsers', authMiddleware(['Admin']), userController.createUser);
router.get('/getUsersByOrg', authMiddleware(['Admin']), userController.getUsersByOrganisation);
router.get('/searchUsers', authMiddleware(['Admin']), userController.searchUsers);
router.get('/getuserById/:userId', authMiddleware(['Admin']), userController.getUserDetails);
router.patch('/toggleStatus/:userId', authMiddleware(['Admin']), userController.toggleUserStatus);
router.post('/bulkCreateUsers', authMiddleware(['Admin']), upload.single('file'), userController.bulkCreateUsers);

module.exports = router;