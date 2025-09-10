import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// Middleware for single file upload
export const uploadSingleImage = upload.single('image');

// Middleware for multiple file uploads
export const uploadMultipleImages = upload.array('images', 10); // Limit to 10 images

// Error handling middleware for file uploads
export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // A multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum file size is 5MB',
      });
    }
    return res.status(400).json({
      error: `Upload error: ${err.message}`,
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(400).json({
      error: err.message || 'An error occurred during file upload',
    });
  }
  next();
};
