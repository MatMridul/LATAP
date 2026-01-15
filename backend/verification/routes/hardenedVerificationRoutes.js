const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');
const { authenticateToken, logAudit, isValidUUID } = require('../../middleware/identityAuth');

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

/**
 * POST /api/verification/submit
 * Submit verification request - ENFORCES user_id from JWT only
 */
router.post('/submit', authenticateToken, upload.single('document'), async (req, res) => {
    try {
        const requiredFields = ['claimed_name', 'claimed_institution', 'claimed_program', 'claimed_start_year', 'claimed_end_year'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ error: 'Missing required fields', missingFields });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Document file is required' });
        }

        // Validate years
        const startYear = parseInt(req.body.claimed_start_year);
        const endYear = parseInt(req.body.claimed_end_year);
        const currentYear = new Date().getFullYear();

        if (startYear < 1950 || startYear > currentYear || endYear < startYear || endYear > currentYear + 5) {
            return res.status(400).json({ error: 'Invalid year range' });
        }

        // Generate document hash for deduplication
        const fileBuffer = fs.readFileSync(req.file.path);
        const documentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        // Check for duplicate submissions
        const existingRequest = await pool.query(
            'SELECT id FROM verification_requests WHERE document_hash = $1',
            [documentHash]
        );

        if (existingRequest.rows.length > 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Document already submitted' });
        }

        // Create verification request using ONLY req.user.id
        const verificationId = uuidv4();
        await pool.query(`
            INSERT INTO verification_requests (
                id, user_id, claimed_name, claimed_institution, claimed_program,
                claimed_start_year, claimed_end_year, document_path, document_hash, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
            verificationId,
            req.user.id, // IMMUTABLE user_id from JWT
            req.body.claimed_name.trim(),
            req.body.claimed_institution.trim(),
            req.body.claimed_program.trim(),
            startYear,
            endYear,
            req.file.path,
            documentHash,
            'PENDING'
        ]);

        // Audit log verification submission
        await logAudit({
            user_id: req.user.id,
            action: 'VERIFICATION_SUBMITTED',
            entity_type: 'verification_request',
            entity_id: verificationId,
            metadata: {
                claimed_institution: req.body.claimed_institution,
                claimed_program: req.body.claimed_program,
                document_hash: documentHash
            },
            req
        });

        res.json({
            success: true,
            message: 'Verification request submitted successfully',
            verificationId: verificationId
        });

    } catch (error) {
        console.error('Verification submission error:', error);
        
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: 'Failed to submit verification request' });
    }
});

/**
 * GET /api/verification/status/:id
 * Get verification status - ENFORCES user ownership
 */
router.get('/status/:id', authenticateToken, async (req, res) => {
    try {
        if (!isValidUUID(req.params.id)) {
            return res.status(400).json({ error: 'Invalid verification ID' });
        }

        // Only return verification requests owned by authenticated user
        const result = await pool.query(`
            SELECT vr.*, va.status as attempt_status, va.decision, va.failure_reason, va.created_at as attempt_created_at
            FROM verification_requests vr
            LEFT JOIN verification_attempts va ON vr.id = va.verification_request_id
            WHERE vr.id = $1 AND vr.user_id = $2
            ORDER BY va.created_at DESC
            LIMIT 1
        `, [req.params.id, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Verification request not found' });
        }

        res.json({ verification: result.rows[0] });

    } catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({ error: 'Failed to get verification status' });
    }
});

/**
 * GET /api/verification/my-requests
 * Get all verification requests for authenticated user
 */
router.get('/my-requests', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT vr.id, vr.claimed_institution, vr.claimed_program, vr.status, vr.created_at,
                   COUNT(va.id) as attempt_count
            FROM verification_requests vr
            LEFT JOIN verification_attempts va ON vr.id = va.verification_request_id
            WHERE vr.user_id = $1
            GROUP BY vr.id, vr.claimed_institution, vr.claimed_program, vr.status, vr.created_at
            ORDER BY vr.created_at DESC
        `, [req.user.id]);

        res.json({ requests: result.rows });

    } catch (error) {
        console.error('Get user verification requests error:', error);
        res.status(500).json({ error: 'Failed to get verification requests' });
    }
});

module.exports = router;
