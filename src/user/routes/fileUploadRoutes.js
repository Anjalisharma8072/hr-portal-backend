const express = require('express');
const router = express.Router();
const fileUploadService = require('../services/fileUploadService');
const authMiddleware = require('../../../middleware/authMiddleware');
const path = require('path'); // Added missing import for path

/**
 * @route   POST /api/user/upload/logo
 * @desc    Upload company logo
 * @access  Private
 */
router.post('/logo', 
  authMiddleware(['User', 'Admin', 'Superadmin']), 
  fileUploadService.getUploadInstance('logo'),
  async (req, res) => {
    try {
      console.log('📤 [FileUploadRoutes] Logo upload request received');

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Get company ID from request body or user context
      const companyId = req.body.companyId || req.user.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      // Upload and process the logo
      const logoData = await fileUploadService.uploadCompanyLogo(req.file, companyId);

      console.log('✅ [FileUploadRoutes] Logo uploaded successfully');

      res.status(200).json({
        success: true,
        message: 'Logo uploaded successfully',
        data: logoData
      });

    } catch (error) {
      console.error('❌ [FileUploadRoutes] Logo upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading logo',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/user/upload/document
 * @desc    Upload single document
 * @access  Private
 */
router.post('/document',
  authMiddleware(['User', 'Admin', 'Superadmin']),
  fileUploadService.getUploadInstance('document'),
  async (req, res) => {
    try {
      console.log('📄 [FileUploadRoutes] Document upload request received');

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Extract metadata from request body
      const metadata = {
        uploadedBy: req.user.id,
        purpose: req.body.purpose || 'general',
        category: req.body.category || 'document',
        tags: req.body.tags ? req.body.tags.split(',') : [],
        description: req.body.description || ''
      };

      // Upload the document
      const documentData = await fileUploadService.uploadDocument(req.file, metadata);

      console.log('✅ [FileUploadRoutes] Document uploaded successfully');

      res.status(200).json({
        success: true,
        message: 'Document uploaded successfully',
        data: documentData
      });

    } catch (error) {
      console.error('❌ [FileUploadRoutes] Document upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading document',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/user/upload/attachments
 * @desc    Upload multiple attachments
 * @access  Private
 */
router.post('/attachments',
  authMiddleware(['User', 'Admin', 'Superadmin']),
  fileUploadService.getMultipleUploadInstance('attachment', 10),
  async (req, res) => {
    try {
      console.log('📎 [FileUploadRoutes] Multiple attachments upload request received');

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Extract metadata from request body
      const metadata = {
        uploadedBy: req.user.id,
        purpose: req.body.purpose || 'attachment',
        category: req.body.category || 'general',
        tags: req.body.tags ? req.body.tags.split(',') : [],
        description: req.body.description || '',
        relatedTo: req.body.relatedTo || null
      };

      // Upload multiple attachments
      const attachmentsData = await fileUploadService.uploadMultipleAttachments(req.files, metadata);

      console.log('✅ [FileUploadRoutes] Multiple attachments uploaded successfully');

      res.status(200).json({
        success: true,
        message: `${attachmentsData.length} attachments uploaded successfully`,
        data: attachmentsData
      });

    } catch (error) {
      console.error('❌ [FileUploadRoutes] Multiple attachments upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading attachments',
        error: error.message
      });
    }
  }
);

/**
 * @route   POST /api/user/upload/mixed
 * @desc    Upload mixed file types (logo + documents)
 * @access  Private
 */
router.post('/mixed',
  authMiddleware(['User', 'Admin', 'Superadmin']),
  fileUploadService.getFieldsUploadInstance([
    { name: 'logo', maxCount: 1 },
    { name: 'documents', maxCount: 5 },
    { name: 'attachments', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      console.log('🔄 [FileUploadRoutes] Mixed files upload request received');

      const results = {
        logo: null,
        documents: [],
        attachments: []
      };

      // Process logo if uploaded
      if (req.files.logo && req.files.logo[0]) {
        const companyId = req.body.companyId || req.user.companyId;
        if (companyId) {
          results.logo = await fileUploadService.uploadCompanyLogo(req.files.logo[0], companyId);
        }
      }

      // Process documents if uploaded
      if (req.files.documents && req.files.documents.length > 0) {
        const metadata = {
          uploadedBy: req.user.id,
          purpose: req.body.purpose || 'document',
          category: req.body.category || 'general'
        };
        results.documents = await fileUploadService.uploadMultipleAttachments(req.files.documents, metadata);
      }

      // Process attachments if uploaded
      if (req.files.attachments && req.files.attachments.length > 0) {
        const metadata = {
          uploadedBy: req.user.id,
          purpose: req.body.purpose || 'attachment',
          category: req.body.category || 'general'
        };
        results.attachments = await fileUploadService.uploadMultipleAttachments(req.files.attachments, metadata);
      }

      console.log('✅ [FileUploadRoutes] Mixed files uploaded successfully');

      res.status(200).json({
        success: true,
        message: 'Files uploaded successfully',
        data: results
      });

    } catch (error) {
      console.error('❌ [FileUploadRoutes] Mixed files upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading files',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/user/upload/file/:filename
 * @desc    Delete uploaded file
 * @access  Private
 */
router.delete('/file/:filename', authMiddleware(['User', 'Admin', 'Superadmin']), async (req, res) => {
  try {
    console.log('🗑️ [FileUploadRoutes] File deletion request received:', req.params.filename);

    const { filename } = req.params;
    const { type } = req.query; // logo, document, attachment

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'File type is required'
      });
    }

    // Construct file path based on type
    let filePath;
    switch (type) {
      case 'logo':
        filePath = path.join(fileUploadService.uploadDir, 'logos', filename);
        break;
      case 'document':
        filePath = path.join(fileUploadService.uploadDir, 'documents', filename);
        break;
      case 'attachment':
        filePath = path.join(fileUploadService.uploadDir, 'attachments', filename);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid file type'
        });
    }

    // Delete the file
    const result = await fileUploadService.deleteFile(filePath);

    console.log('✅ [FileUploadRoutes] File deleted successfully');

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ [FileUploadRoutes] File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/user/upload/info/:filename
 * @desc    Get file information
 * @access  Private
 */
router.get('/info/:filename', authMiddleware(['User', 'Admin', 'Superadmin']), async (req, res) => {
  try {
    console.log('ℹ️ [FileUploadRoutes] File info request received:', req.params.filename);

    const { filename } = req.params;
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'File type is required'
      });
    }

    // Construct file path based on type
    let filePath;
    switch (type) {
      case 'logo':
        filePath = path.join(fileUploadService.uploadDir, 'logos', filename);
        break;
      case 'document':
        filePath = path.join(fileUploadService.uploadDir, 'documents', filename);
        break;
      case 'attachment':
        filePath = path.join(fileUploadService.uploadDir, 'attachments', filename);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid file type'
        });
    }

    // Get file information
    const fileInfo = await fileUploadService.getFileInfo(filePath);

    console.log('✅ [FileUploadRoutes] File info retrieved successfully');

    res.status(200).json({
      success: true,
      data: fileInfo
    });

  } catch (error) {
    console.error('❌ [FileUploadRoutes] File info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file info',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/user/upload/limits
 * @desc    Get upload limits and allowed types
 * @access  Private
 */
router.get('/limits', authMiddleware(['User', 'Admin', 'Superadmin']), (req, res) => {
  try {
    console.log('📏 [FileUploadRoutes] Upload limits request received');

    const limits = {
      logo: {
        maxSize: fileUploadService.getFileSizeLimit('logo'),
        allowedTypes: fileUploadService.getAllowedFileTypes('logo'),
        maxFiles: 1
      },
      document: {
        maxSize: fileUploadService.getFileSizeLimit('document'),
        allowedTypes: fileUploadService.getAllowedFileTypes('document'),
        maxFiles: 5
      },
      attachment: {
        maxSize: fileUploadService.getFileSizeLimit('attachment'),
        allowedTypes: fileUploadService.getAllowedFileTypes('attachment'),
        maxFiles: 10
      }
    };

    console.log('✅ [FileUploadRoutes] Upload limits retrieved successfully');

    res.status(200).json({
      success: true,
      data: limits
    });

  } catch (error) {
    console.error('❌ [FileUploadRoutes] Upload limits error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting upload limits',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/user/upload/cleanup
 * @desc    Clean up temporary files
 * @access  Private (Admin only)
 */
router.post('/cleanup', authMiddleware(['Admin', 'Superadmin']), async (req, res) => {
  try {
    console.log('🧹 [FileUploadRoutes] Cleanup request received');

    const { maxAgeHours = 24 } = req.body;

    // Only allow cleanup for admin users
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Perform cleanup
    const result = await fileUploadService.cleanupTempFiles(maxAgeHours);

    console.log('✅ [FileUploadRoutes] Cleanup completed successfully');

    res.status(200).json({
      success: true,
      message: 'Cleanup completed successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ [FileUploadRoutes] Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during cleanup',
      error: error.message
    });
  }
});

module.exports = router;
