const Organisation = require('../../organisation/model/organisation');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');
const { v4: uuidv4 } = require('uuid'); // for unique organisationId

// CREATE organisation
exports.createOrganisation = async (req, res) => {
   console.log('🏢 [SuperAdmin] Create organisation request received:', { organisationName: req.body.organisationName });
   try {
      const { organisationName, paymentStatus } = req.body;
      console.log('📝 Create organisation data:', { organisationName, paymentStatus });

      if (!organisationName) {
         console.log('❌ Missing organisation name');
         return errorResponse(res, 'Organisation name is required', 400);
      }

      console.log('🔍 Checking for existing organisation...');
      const existing = await Organisation.findOne({ organisationName });
      if (existing) {
         console.log('❌ Organisation already exists:', organisationName);
         return errorResponse(res, 'Organisation with this name already exists', 400);
      }
      console.log('✅ No existing organisation found');

      console.log('🆔 Generating unique organisation ID...');
      const organisationId = uuidv4(); // generate unique ID
      console.log('✅ Organisation ID generated:', organisationId);

      console.log('💾 Creating new organisation...');
      const organisation = new Organisation({
         organisationName,
         paymentStatus,
         organisationId
      });

      await organisation.save();
      console.log('✅ Organisation created successfully');

      console.log('✅ Organisation creation completed successfully');
      return successResponse(res, 'Organisation created successfully', organisation, 201);
   } catch (error) {
      console.error('❌ CreateOrganisation Error:', error);
      return errorResponse(res, 'Server error creating organisation');
   }
};

// GET all organisations
exports.getAllOrganisations = async (req, res) => {
   console.log('📋 [SuperAdmin] Get all organisations request received');
   try {
      console.log('🔍 Fetching all organisations...');
      const organisations = await Organisation.find();
      console.log('✅ Found', organisations.length, 'organisations');

      console.log('✅ All organisations retrieved successfully');
      return successResponse(res, 'All organisations retrieved', organisations);
   } catch (error) {
      console.error('❌ GetAllOrganisations Error:', error);
      return errorResponse(res, 'Server error retrieving organisations');
   }
};

// GET organisation by ID
exports.getOrganisationById = async (req, res) => {
   console.log('🔍 [SuperAdmin] Get organisation by ID request received:', { id: req.params.id });
   try {
      const { id } = req.params;
      console.log('📝 Organisation ID:', id);

      console.log('🔍 Finding organisation...');
      const organisation = await Organisation.findById(id);
      if (!organisation) {
         console.log('❌ Organisation not found:', id);
         return errorResponse(res, 'Organisation not found', 404);
      }
      console.log('✅ Organisation found:', organisation.organisationName);

      console.log('✅ Organisation retrieved successfully');
      return successResponse(res, 'Organisation retrieved', organisation);
   } catch (error) {
      console.error('❌ GetOrganisationById Error:', error);
      return errorResponse(res, 'Server error retrieving organisation');
   }
};

// UPDATE organisation
exports.updateOrganisation = async (req, res) => {
   console.log('✏️ [SuperAdmin] Update organisation request received:', { id: req.params.id });
   try {
      const { id } = req.params;
      const updates = req.body;
      console.log('📝 Update data:', updates);

      console.log('🔍 Finding and updating organisation...');
      const updated = await Organisation.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) {
         console.log('❌ Organisation not found:', id);
         return errorResponse(res, 'Organisation not found', 404);
      }
      console.log('✅ Organisation updated successfully');

      console.log('✅ Organisation update completed successfully');
      return successResponse(res, 'Organisation updated successfully', updated);
   } catch (error) {
      console.error('❌ UpdateOrganisation Error:', error);
      return errorResponse(res, 'Server error updating organisation');
   }
};

// DELETE organisation
exports.deleteOrganisation = async (req, res) => {
   console.log('🗑️ [SuperAdmin] Delete organisation request received:', { id: req.params.id });
   try {
      const { id } = req.params;
      console.log('📝 Organisation ID to delete:', id);

      console.log('🔍 Finding and deleting organisation...');
      const deleted = await Organisation.findByIdAndDelete(id);
      if (!deleted) {
         console.log('❌ Organisation not found:', id);
         return errorResponse(res, 'Organisation not found', 404);
      }
      console.log('✅ Organisation deleted successfully');

      console.log('✅ Organisation deletion completed successfully');
      return successResponse(res, 'Organisation deleted successfully');
   } catch (error) {
      console.error('❌ DeleteOrganisation Error:', error);
      return errorResponse(res, 'Server error deleting organisation');
   }
};
