const express = require('express');
const router = express.Router();
const organisationController = require('../controller/organisationController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Only Superadmin should access these
router.post('/', authMiddleware(['Superadmin']), organisationController.createOrganisation);
router.get('/', authMiddleware(['Superadmin']), organisationController.getAllOrganisations);
router.get('/:id', authMiddleware(['Superadmin']), organisationController.getOrganisationById);
router.put('/:id', authMiddleware(['Superadmin']), organisationController.updateOrganisation);
router.delete('/:id', authMiddleware(['Superadmin']), organisationController.deleteOrganisation);

module.exports = router;

