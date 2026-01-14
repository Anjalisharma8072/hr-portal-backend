const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

/**
 * File Upload Service
 * Handles file uploads, image processing, and file management
 */
class FileUploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../../uploads');
    this.upload = null;
    this.storage = null;
    this.fileFilter = null;
    this.setupMulter();
    this.ensureUploadDirectoriesSync();
    console.log('✅ [FileUploadService] Initialized successfully');
  }

  ensureUploadDirectoriesSync() {
    try {
      const directories = [
        this.uploadDir,
        path.join(this.uploadDir, 'logos'),
        path.join(this.uploadDir, 'documents'),
        path.join(this.uploadDir, 'attachments'),
        path.join(this.uploadDir, 'temp')
      ];

      for (const dir of directories) {
        try {
          if (!require('fs').existsSync(dir)) {
            require('fs').mkdirSync(dir, { recursive: true });
            console.log('📁 [FileUploadService] Created directory:', dir);
          }
        } catch (error) {
          console.log('⚠️ [FileUploadService] Directory creation warning:', dir, error.message);
        }
      }
    } catch (error) {
      console.error('❌ [FileUploadService] Error creating directories:', error);
    }
  }



  /**
   * Setup multer configuration
   */
  setupMulter() {
    // Configure storage for different file types
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        let uploadPath = this.uploadDir;
        
        switch (file.fieldname) {
          case 'logo':
            uploadPath = path.join(this.uploadDir, 'logos');
            break;
          case 'document':
          case 'templateFile':
            uploadPath = path.join(this.uploadDir, 'documents');
            break;
          case 'attachment':
            uploadPath = path.join(this.uploadDir, 'attachments');
            break;
          default:
            uploadPath = path.join(this.uploadDir, 'temp');
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const name = path.basename(file.originalname, extension);
        
        cb(null, `${name}-${uniqueSuffix}${extension}`);
      }
    });

    // File filter for different types
    this.fileFilter = (req, file, cb) => {
      const allowedTypes = {
        logo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        templateFile: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        attachment: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain']
      };

      const fieldType = file.fieldname;
      const allowedMimes = allowedTypes[fieldType] || allowedTypes.attachment;

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type for ${fieldType}. Allowed: ${allowedMimes.join(', ')}`), false);
      }
    };

    // Create multer instance
    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files per request
      }
    });
  }

  /**
   * Get multer instance for specific field
   */
  getUploadInstance(fieldName) {
    return this.upload.single(fieldName);
  }

  /**
   * Get multer instance for multiple files
   */
  getMultipleUploadInstance(fieldName, maxCount = 5) {
    return this.upload.array(fieldName, maxCount);
  }

  /**
   * Get multer instance for multiple fields
   */
  getFieldsUploadInstance(fields) {
    return this.upload.fields(fields);
  }

  /**
   * Process and optimize uploaded image
   */
  async processImage(filePath, options = {}) {
    try {
      const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'jpeg',
        resize = true
      } = options;

      const image = sharp(filePath);
      let processedImage = image;

      // Resize if requested
      if (resize) {
        processedImage = image.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert format and set quality
      if (format === 'jpeg') {
        processedImage = processedImage.jpeg({ quality });
      } else if (format === 'png') {
        processedImage = processedImage.png({ quality });
      } else if (format === 'webp') {
        processedImage = processedImage.webp({ quality });
      }

      // Generate processed file path
      const dir = path.dirname(filePath);
      const ext = path.extname(filePath);
      const name = path.basename(filePath, ext);
      const processedPath = path.join(dir, `${name}-processed.${format}`);

      // Save processed image
      await processedImage.toFile(processedPath);

      // Get image metadata
      const metadata = await image.metadata();

      console.log('✅ [FileUploadService] Image processed successfully:', processedPath);

      return {
        originalPath: filePath,
        processedPath,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: metadata.size
        }
      };

    } catch (error) {
      console.error('❌ [FileUploadService] Error processing image:', error);
      throw error;
    }
  }

  /**
   * Process company logo with specific requirements
   */
  async processCompanyLogo(filePath) {
    try {
      console.log('🏢 [FileUploadService] Processing company logo:', filePath);

      const options = {
        width: 300,
        height: 200,
        quality: 90,
        format: 'png',
        resize: true
      };

      const result = await this.processImage(filePath, options);

      // Create thumbnail version
      const thumbnailOptions = {
        width: 100,
        height: 67,
        quality: 80,
        format: 'png',
        resize: true
      };

      const thumbnail = await this.processImage(filePath, thumbnailOptions);

      console.log('✅ [FileUploadService] Company logo processed successfully');

      return {
        ...result,
        thumbnail: thumbnail.processedPath
      };

    } catch (error) {
      console.error('❌ [FileUploadService] Error processing company logo:', error);
      throw error;
    }
  }

  /**
   * Upload and process company logo
   */
  async uploadCompanyLogo(file, companyId) {
    try {
      console.log('📤 [FileUploadService] Uploading company logo for:', companyId);

      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) {
        throw new Error('Invalid file type. Only images are allowed.');
      }

      // Process the logo
      const processedLogo = await this.processCompanyLogo(file.path);

      // Generate public URL
      const publicUrl = `/uploads/logos/${path.basename(processedLogo.processedPath)}`;
      const thumbnailUrl = `/uploads/logos/${path.basename(processedLogo.thumbnail)}`;

      console.log('✅ [FileUploadService] Company logo uploaded successfully');

      return {
        originalFile: file.originalname,
        originalPath: file.path,
        processedPath: processedLogo.processedPath,
        thumbnailPath: processedLogo.thumbnail,
        publicUrl,
        thumbnailUrl,
        metadata: processedLogo.metadata
      };

    } catch (error) {
      console.error('❌ [FileUploadService] Error uploading company logo:', error);
      throw error;
    }
  }

  /**
   * Upload document attachment
   */
  async uploadDocument(file, metadata = {}) {
    try {
      console.log('📄 [FileUploadService] Uploading document:', file.originalname);

      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid document type. Only PDF, Word, and text files are allowed.');
      }

      // Generate public URL
      const publicUrl = `/uploads/documents/${path.basename(file.path)}`;

      // Get file info
      const stats = await fs.stat(file.path);
      const fileInfo = {
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        publicUrl,
        mimeType: file.mimetype,
        size: stats.size,
        uploadedAt: new Date(),
        metadata
      };

      console.log('✅ [FileUploadService] Document uploaded successfully');

      return fileInfo;

    } catch (error) {
      console.error('❌ [FileUploadService] Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Upload multiple attachments
   */
  async uploadMultipleAttachments(files, metadata = {}) {
    try {
      console.log('📎 [FileUploadService] Uploading multiple attachments:', files.length);

      if (!Array.isArray(files) || files.length === 0) {
        throw new Error('No files provided');
      }

      const uploadPromises = files.map(file => this.uploadDocument(file, metadata));
      const results = await Promise.all(uploadPromises);

      console.log('✅ [FileUploadService] Multiple attachments uploaded successfully');

      return results;

    } catch (error) {
      console.error('❌ [FileUploadService] Error uploading multiple attachments:', error);
      throw error;
    }
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(filePath) {
    try {
      console.log('🗑️ [FileUploadService] Deleting file:', filePath);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        console.log('⚠️ [FileUploadService] File not found:', filePath);
        return { success: true, message: 'File not found' };
      }

      // Delete the file
      await fs.unlink(filePath);

      console.log('✅ [FileUploadService] File deleted successfully:', filePath);

      return { success: true, message: 'File deleted successfully' };

    } catch (error) {
      console.error('❌ [FileUploadService] Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(maxAgeHours = 24) {
    try {
      console.log('🧹 [FileUploadService] Cleaning up temporary files');

      const tempDir = path.join(this.uploadDir, 'temp');
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        
        try {
          const stats = await fs.stat(filePath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            await fs.unlink(filePath);
            deletedCount++;
            console.log('🗑️ [FileUploadService] Cleaned up temp file:', file);
          }
        } catch (error) {
          console.log('⚠️ [FileUploadService] Error processing temp file:', file, error.message);
        }
      }

      console.log(`✅ [FileUploadService] Cleanup completed. Deleted ${deletedCount} files`);

      return { success: true, deletedCount };

    } catch (error) {
      console.error('❌ [FileUploadService] Error during cleanup:', error);
      throw error;
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath);
      const name = path.basename(filePath, ext);

      return {
        fileName: path.basename(filePath),
        name,
        extension: ext,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory()
      };

    } catch (error) {
      console.error('❌ [FileUploadService] Error getting file info:', error);
      throw error;
    }
  }

  /**
   * Validate file size
   */
  validateFileSize(fileSize, maxSize = 10 * 1024 * 1024) {
    return fileSize <= maxSize;
  }

  /**
   * Get allowed file types for field
   */
  getAllowedFileTypes(fieldName) {
    const allowedTypes = {
      logo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      attachment: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain']
    };

    return allowedTypes[fieldName] || allowedTypes.attachment;
  }



  /**
   * Get file size limit for field
   */
  getFileSizeLimit(fieldName) {
    const sizeLimits = {
      logo: 5 * 1024 * 1024, // 5MB for logos
      document: 10 * 1024 * 1024, // 10MB for documents
      attachment: 15 * 1024 * 1024 // 15MB for attachments
    };

    return sizeLimits[fieldName] || 10 * 1024 * 1024; // Default 10MB
  }
}

module.exports = new FileUploadService();
