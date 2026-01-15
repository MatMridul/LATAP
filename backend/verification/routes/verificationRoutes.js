const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Pool } = require('pg');
const VerificationEngine = require('../engine/VerificationEngine');
const { authenticateToken, logAudit, isValidUUID } = require('../../middleware/identityAuth');

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/verification');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `verification-${uniqueSuffix}.pdf`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

const verificationEngine = new VerificationEngine();

/**
 * POST /api/verification/submit
 * Submit verification request with document
 * ENFORCES: user_id from req.user.id ONLY
 */
router.post('/submit', authenticateToken, upload.single('document'), async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['claimed_name', 'claimed_institution', 'claimed_program', 'claimed_start_year', 'claimed_end_year'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                missingFields
            });
        }

        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Document file is required'
            });
        }

        // Validate years
        const startYear = parseInt(req.body.claimed_start_year);
        const endYear = parseInt(req.body.claimed_end_year);
        const currentYear = new Date().getFullYear();

        if (startYear < 1950 || startYear > currentYear) {
            return res.status(400).json({
                success: false,
                error: 'Invalid start year'
            });
        }

        if (endYear < startYear || endYear > currentYear + 5) {
            return res.status(400).json({
                success: false,
                error: 'Invalid end year'
            });
        }

        // Prepare user claims
        const userClaims = {
            claimed_name: req.body.claimed_name.trim(),
            claimed_institution: req.body.claimed_institution.trim(),
            claimed_program: req.body.claimed_program.trim(),
            claimed_start_year: startYear,
            claimed_end_year: endYear
        };

        // Start verification process using ONLY authenticated user_id
        const result = await verificationEngine.startVerification(
            req.user.id,  // ENFORCED: Never accept user_id from request body
            userClaims,
            req.file
        );

        // Audit log verification submission
        await AuditLogger.logVerificationSubmission(
            req.user.id, 
            result.verificationId, 
            { 
                claimed_institution: userClaims.claimed_institution,
                claimed_program: userClaims.claimed_program,
                file_size: req.file.size 
            }, 
            req
        );

        res.json({
            success: true,
            message: 'Verification request submitted successfully',
            verificationId: result.verificationId,
            status: result.status
        });

    } catch (error) {
        console.error('Verification submission error:', error);
        
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: 'Failed to submit verification request'
        });
    }
});

/**
 * GET /api/verification/status/:id
 * Get verification status by ID
 * ENFORCES: Only return data for authenticated user's verifications
 */
router.get('/status/:id', authenticateToken, async (req, res) => {
    try {
        const verificationId = req.params.id;
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(verificationId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid verification ID format'
            });
        }

        const result = await verificationEngine.getVerificationStatus(verificationId, req.user.id);
        
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Verification not found or access denied'
            });
        }

        res.json({
            success: true,
            verification: result
        });

    } catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get verification status'
        });
    }
});

/**
 * GET /api/verification/user-status
 * Get current user's verification status
 * ENFORCES: Uses req.user.id ONLY
 */
router.get('/user-status', authenticateToken, async (req, res) => {
    try {
        const result = await verificationEngine.getUserVerificationStatus(req.user.id);
        
        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Get user verification status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user verification status'
        });
    }
});

/**
 * GET /api/verification/history
 * Get user's verification history
 * ENFORCES: Uses req.user.id ONLY
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const history = await verificationEngine.getUserVerificationHistory(req.user.id);
        
        res.json({
            success: true,
            history
        });

    } catch (error) {
        console.error('Get verification history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get verification history'
        });
    }
});

module.exports = router;
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                missingFields
            });
        }

        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Document file is required'
            });
        }

        // Validate years
        const startYear = parseInt(req.body.claimed_start_year);
        const endYear = parseInt(req.body.claimed_end_year);
        const currentYear = new Date().getFullYear();

        if (startYear < 1950 || startYear > currentYear) {
            return res.status(400).json({
                success: false,
                error: 'Invalid start year'
            });
        }

        if (endYear < startYear || endYear > currentYear + 5) {
            return res.status(400).json({
                success: false,
                error: 'Invalid end year'
            });
        }

        // Prepare user claims
        const userClaims = {
            claimed_name: req.body.claimed_name.trim(),
            claimed_institution: req.body.claimed_institution.trim(),
            claimed_program: req.body.claimed_program.trim(),
            claimed_start_year: startYear,
            claimed_end_year: endYear
        };

        // Start verification process
        const result = await verificationEngine.startVerification(
            req.user.id,
            userClaims,
            req.file
        );

        res.json({
            success: true,
            verificationId: result.verificationId,
            message: result.message
        });

    } catch (error) {
        console.error('Verification submission error:', error);

        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (error.message.includes('PDF files are supported') || 
            error.message.includes('already been submitted')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Verification submission failed. Please try again.'
        });
    }
});

/**
 * GET /api/verification/status/:id
 * Get verification status
 */
router.get('/status/:id', auth, async (req, res) => {
    try {
        const verificationId = req.params.id;
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(verificationId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid verification ID format'
            });
        }

        const status = await verificationEngine.getVerificationStatus(verificationId);

        res.json({
            success: true,
            verification: status
        });

    } catch (error) {
        console.error('Get verification status error:', error);

        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: 'Verification request not found'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to retrieve verification status'
        });
    }
});

/**
 * GET /api/verification/user-status
 * Get current user's verification status
 */
router.get('/user-status', auth, async (req, res) => {
    try {
        const { Pool } = require('pg');
        const db = new Pool({ connectionString: process.env.DATABASE_URL });

        // Get user's current verification status
        const userResult = await db.query(`
            SELECT verification_status, verification_expires_at
            FROM users WHERE id = $1
        `, [req.user.id]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Get latest verification request
        const requestResult = await db.query(`
            SELECT id, status, match_score, verified_at, expires_at, created_at, updated_at
            FROM verification_requests 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 1
        `, [req.user.id]);

        const latestRequest = requestResult.rows[0] || null;

        // Get latest progress if there's an active request
        let latestProgress = null;
        if (latestRequest && ['PENDING', 'PROCESSING_OCR', 'MATCHING'].includes(latestRequest.status)) {
            const progressResult = await db.query(`
                SELECT * FROM verification_progress 
                WHERE verification_request_id = $1 
                ORDER BY created_at DESC 
                LIMIT 1
            `, [latestRequest.id]);
            
            latestProgress = progressResult.rows[0] || null;
        }

        res.json({
            success: true,
            userVerificationStatus: user.verification_status,
            userVerificationExpiresAt: user.verification_expires_at,
            latestRequest,
            latestProgress
        });

    } catch (error) {
        console.error('Get user verification status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve user verification status'
        });
    }
});

/**
 * POST /api/verification/check-expired
 * Admin endpoint to check and mark expired verifications
 */
router.post('/check-expired', auth, async (req, res) => {
    try {
        // Check if user is admin (you may want to add admin middleware)
        if (!req.user.is_admin) {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        const expiredCount = await verificationEngine.checkExpiredVerifications();

        res.json({
            success: true,
            expiredCount,
            message: `Marked ${expiredCount} verifications as expired`
        });

    } catch (error) {
        console.error('Check expired verifications error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check expired verifications'
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum size is 10MB.'
            });
        }
    }
    
    if (error.message === 'Only PDF files are allowed') {
        return res.status(400).json({
            success: false,
            error: 'Only PDF files are supported for verification'
        });
    }

    next(error);
});

module.exports = router;
