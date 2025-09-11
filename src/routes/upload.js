import express from 'express';
import multer from 'multer';
import { uploadFile, deleteFile, testCloudinaryConfig } from '../controllers/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and documents
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
    }
  }
});

// Protected routes
router.use(protect);

router.get('/test', testCloudinaryConfig);
router.post('/', upload.single('file'), uploadFile);
router.delete('/:publicId', deleteFile);

export default router;