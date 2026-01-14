const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const authMiddleware = require('../../../middleware/authMiddleware');

router.post('/admins', authMiddleware(['Superadmin']), adminController.createAdmin);
router.get('/admins', authMiddleware(['Superadmin']), adminController.getAllAdmins);
router.get('/org/:orgId/admins', authMiddleware(['Superadmin']), adminController.getAdminsByOrganisation);
router.get('/admins/:adminId', authMiddleware(['Superadmin']), adminController.getAdminDetails);
router.put('/admins/:adminId', authMiddleware(['Superadmin']), adminController.updateAdmin);
router.delete('/admins/:adminId', authMiddleware(['Superadmin']), adminController.deleteAdmin);
router.patch('/toggleAdminStatus/:adminId', authMiddleware(['Superadmin']), adminController.toggleAdminStatus);
module.exports = router;