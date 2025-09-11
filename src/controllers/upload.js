import { v2 as cloudinary } from 'cloudinary';

// Debug: Log Cloudinary config values
console.log('Cloudinary config:', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload file to Cloudinary
// @route   POST /api/v1/upload
// @access  Private
export const uploadFile = async (req, res, next) => {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing:', {
        cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
        api_key: !!process.env.CLOUDINARY_API_KEY,
        api_secret: !!process.env.CLOUDINARY_API_SECRET
      });
      return res.status(500).json({
        success: false,
        error: 'File upload service not configured. Please check Cloudinary credentials.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log('Uploading file:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Determine resource type based on file type
    let resourceType = 'auto';
    if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else {
      resourceType = 'raw'; // For documents
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'publiccare',
          transformation: resourceType === 'image' ? [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
          ] : undefined
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful:', result.public_id);
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Determine file type for our system
    let fileType = 'document';
    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      fileType = 'video';
    }

    const fileData = {
      filename: req.file.originalname,
      url: result.secure_url,
      type: fileType,
      size: req.file.size,
      publicId: result.public_id
    };

    console.log('File upload completed successfully:', fileData.filename);
    res.status(200).json({
      success: true,
      data: fileData
    });
  } catch (error) {
    // Improved error logging
    if (error && typeof error === 'object') {
      console.error('Upload error details:', {
        message: error.message,
        code: error.code,
        statusCode: error.http_code,
        stack: error.stack
      });
    } else {
      console.error('Upload error (non-object):', error);
    }
    
    let errorMessage = 'File upload failed';
    if (error && error.message) {
      errorMessage = error.message;
    } else if (error && error.http_code) {
      errorMessage = `Upload failed with code: ${error.http_code}`;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// @desc    Delete file from Cloudinary
// @route   DELETE /api/v1/upload/:publicId
// @access  Private
export const deleteFile = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'File deletion failed'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'File deletion failed'
    });
  }
};

// @desc    Test Cloudinary configuration
// @route   GET /api/v1/upload/test
// @access  Private
export const testCloudinaryConfig = async (req, res, next) => {
  try {
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };

    const missingConfig = [];
    if (!config.cloud_name) missingConfig.push('CLOUDINARY_CLOUD_NAME');
    if (!config.api_key) missingConfig.push('CLOUDINARY_API_KEY');
    if (!config.api_secret) missingConfig.push('CLOUDINARY_API_SECRET');

    if (missingConfig.length > 0) {
      return res.status(500).json({
        success: false,
        error: `Missing Cloudinary configuration: ${missingConfig.join(', ')}`,
        config: {
          cloud_name: !!config.cloud_name,
          api_key: !!config.api_key,
          api_secret: !!config.api_secret
        }
      });
    }

    // Test Cloudinary connection
    try {
      const result = await cloudinary.api.ping();
      res.status(200).json({
        success: true,
        message: 'Cloudinary configuration is valid',
        config: {
          cloud_name: config.cloud_name,
          api_key: config.api_key ? '***' + config.api_key.slice(-4) : null,
          api_secret: config.api_secret ? '***' + config.api_secret.slice(-4) : null
        }
      });
    } catch (cloudinaryError) {
      res.status(500).json({
        success: false,
        error: 'Cloudinary connection failed',
        details: cloudinaryError.message
      });
    }
  } catch (error) {
    next(error);
  }
};