import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'verification');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Protected verification routes
app.post('/api/verification/upload', authenticateToken, upload.array('documents', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      path: file.path
    }));

    console.log(`User ${req.user.id} uploaded ${uploadedFiles.length} files for verification`);

    res.json({
      message: 'Documents uploaded successfully',
      files: uploadedFiles,
      userId: req.user.id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/verification/submit', authenticateToken, (req, res) => {
  try {
    const { method, documents, institutionName, graduationYear, degree } = req.body;
    
    console.log(`User ${req.user.id} submitted verification:`, {
      method,
      institutionName,
      graduationYear,
      degree,
      documentsCount: documents?.length || 0
    });

    // In a real implementation, this would save to database
    res.json({
      message: 'Verification submitted successfully',
      submissionId: `VER-${Date.now()}`,
      status: 'pending',
      userId: req.user.id
    });
  } catch (error) {
    console.error('Verification submission error:', error);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 LATAP Backend Server running on port ${PORT}`);
  console.log(`📧 Email service configured for: ${process.env.FROM_EMAIL || 'noreply@latap.com'}`);
  console.log(`🔐 JWT authentication enabled`);
});
