const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/verification');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.pdf`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Stub interfaces for unimplemented services
class OCRService {
  static async extractText(documentPath) {
    throw new Error('OCR_SERVICE_NOT_IMPLEMENTED: OCR text extraction service is not yet implemented');
  }
}

class VerificationEngine {
  static async processVerification(request, documentText) {
    throw new Error('VERIFICATION_ENGINE_NOT_IMPLEMENTED: Document verification engine is not yet implemented');
  }
}

class DigiLockerService {
  static async verifyCredentials(claimedData) {
    throw new Error('DIGILOCKER_NOT_IMPLEMENTED: DigiLocker integration is not yet implemented');
  }
}

// POST /api/verification/submit - Submit verification request
router.post('/submit', upload.single('document'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF document is required' });
    }

    const {
      userId,
      institutionId,
      claimedName,
      claimedInstitution,
      claimedProgram,
      claimedStartYear,
      claimedEndYear
    } = req.body;

    // Validate required fields
    if (!userId || !claimedName || !claimedInstitution || !claimedProgram || !claimedStartYear || !claimedEndYear) {
      return res.status(400).json({ error: 'All claim fields are required' });
    }

    // Calculate document hash to prevent duplicates
    const fileBuffer = fs.readFileSync(req.file.path);
    const documentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    await client.query('BEGIN');

    // Check for duplicate document
    const duplicateCheck = await client.query(
      'SELECT id FROM verification_requests WHERE document_hash = $1 AND user_id = $2',
      [documentHash, userId]
    );
    
    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      fs.unlinkSync(req.file.path); // Clean up uploaded file
      return res.status(409).json({ 
        error: 'This document has already been submitted',
        existingRequestId: duplicateCheck.rows[0].id
      });
    }

    // Insert verification request
    const requestId = crypto.randomUUID();
    await client.query(`
      INSERT INTO verification_requests (
        id, user_id, institution_id, claimed_name, claimed_institution, 
        claimed_program, claimed_start_year, claimed_end_year, 
        document_path, document_hash, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', NOW(), NOW())
    `, [
      requestId, userId, institutionId || 'default', claimedName, 
      claimedInstitution, claimedProgram, parseInt(claimedStartYear), 
      parseInt(claimedEndYear), req.file.path, documentHash
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Verification request submitted successfully',
      requestId: requestId,
      status: 'PENDING'
    });

    // Attempt processing asynchronously (will fail with NOT_IMPLEMENTED)
    processVerificationAsync(requestId).catch(error => {
      console.error(`Verification processing failed for ${requestId}:`, error.message);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Verification submission error:', error);
    res.status(500).json({ error: 'Failed to submit verification request' });
  } finally {
    client.release();
  }
});

// GET /api/verification/status/:requestId - Get verification status
router.get('/status/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const requestResult = await pool.query(
      'SELECT * FROM verification_requests WHERE id = $1',
      [requestId]
    );
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    const request = requestResult.rows[0];
    
    const attemptsResult = await pool.query(
      'SELECT * FROM verification_attempts WHERE verification_request_id = $1 ORDER BY attempt_number DESC',
      [requestId]
    );

    const attempts = attemptsResult.rows;
    const lastAttempt = attempts[0];

    res.json({
      requestId: request.id,
      status: request.status,
      totalAttempts: attempts.length,
      canAppeal: attempts.length < 3 && request.status === 'REJECTED',
      canManualReview: attempts.length >= 3,
      lastAttempt: lastAttempt ? {
        attemptNumber: lastAttempt.attempt_number,
        decision: lastAttempt.decision,
        failureReason: lastAttempt.failure_reason,
        completedAt: lastAttempt.completed_at
      } : null,
      createdAt: request.created_at,
      updatedAt: request.updated_at
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

// POST /api/verification/appeal/:requestId - Submit appeal
router.post('/appeal/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason, additionalInfo } = req.body;

    const requestResult = await pool.query(
      'SELECT * FROM verification_requests WHERE id = $1',
      [requestId]
    );
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    const request = requestResult.rows[0];

    const attemptsResult = await pool.query(
      'SELECT COUNT(*) as count FROM verification_attempts WHERE verification_request_id = $1',
      [requestId]
    );

    const attemptCount = parseInt(attemptsResult.rows[0].count);
    
    if (attemptCount >= 3) {
      return res.status(400).json({ error: 'Maximum appeal attempts reached' });
    }

    if (request.status !== 'REJECTED') {
      return res.status(400).json({ error: 'Can only appeal rejected requests' });
    }

    res.json({
      message: 'Appeal submitted successfully',
      requestId,
      appealNumber: attemptCount + 1
    });

    // Attempt new processing (will fail with NOT_IMPLEMENTED)
    processVerificationAsync(requestId, attemptCount + 1).catch(error => {
      console.error(`Appeal processing failed for ${requestId}:`, error.message);
    });

  } catch (error) {
    console.error('Appeal submission error:', error);
    res.status(500).json({ error: 'Failed to submit appeal' });
  }
});

// GET /api/verification/admin/pending - Get requests pending manual review
router.get('/admin/pending', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        vr.id as request_id,
        vr.user_id,
        vr.claimed_name,
        vr.claimed_institution,
        vr.claimed_program,
        vr.created_at,
        COUNT(va.id) as total_attempts
      FROM verification_requests vr
      LEFT JOIN verification_attempts va ON vr.id = va.verification_request_id
      WHERE vr.status = 'MANUAL_REVIEW'
      GROUP BY vr.id, vr.user_id, vr.claimed_name, vr.claimed_institution, vr.claimed_program, vr.created_at
      ORDER BY vr.created_at DESC
    `);

    res.json({ pendingRequests: result.rows });
  } catch (error) {
    console.error('Admin pending requests error:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

// POST /api/verification/admin/review/:requestId - Admin manual review
router.post('/admin/review/:requestId', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { requestId } = req.params;
    const { decision, notes } = req.body; // decision: 'APPROVED' | 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be APPROVED or REJECTED' });
    }

    await client.query('BEGIN');

    const requestResult = await client.query(
      'SELECT * FROM verification_requests WHERE id = $1',
      [requestId]
    );
    
    if (requestResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Verification request not found' });
    }

    const request = requestResult.rows[0];

    if (request.status !== 'MANUAL_REVIEW') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Request is not pending manual review' });
    }

    // Update request status
    await client.query(
      'UPDATE verification_requests SET status = $1, updated_at = NOW() WHERE id = $2',
      [decision, requestId]
    );

    // Record manual review attempt
    await client.query(`
      INSERT INTO verification_attempts (
        id, verification_request_id, attempt_number, status, decision, 
        failure_reason, created_at, completed_at
      ) VALUES ($1, $2, 999, 'COMPLETED', $3, $4, NOW(), NOW())
    `, [
      crypto.randomUUID(), requestId, decision, 
      decision === 'REJECTED' ? notes : null
    ]);

    await client.query('COMMIT');

    res.json({
      message: `Manual review completed: ${decision}`,
      requestId,
      decision,
      reviewedAt: new Date()
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Admin review error:', error);
    res.status(500).json({ error: 'Failed to complete manual review' });
  } finally {
    client.release();
  }
});

// Async processing function - FAILS FAST with NOT_IMPLEMENTED
async function processVerificationAsync(requestId, attemptNumber = 1) {
  const client = await pool.connect();
  
  try {
    // Update status to processing
    await client.query(
      'UPDATE verification_requests SET status = $1, updated_at = NOW() WHERE id = $2',
      ['PROCESSING', requestId]
    );

    const requestResult = await client.query(
      'SELECT * FROM verification_requests WHERE id = $1',
      [requestId]
    );
    
    if (requestResult.rows.length === 0) {
      throw new Error('Verification request not found');
    }

    const request = requestResult.rows[0];

    // Attempt OCR processing - WILL FAIL
    try {
      const ocrText = await OCRService.extractText(request.document_path);
      // This line will never be reached
    } catch (ocrError) {
      // Record failed attempt
      await client.query(`
        INSERT INTO verification_attempts (
          id, verification_request_id, attempt_number, status, decision, 
          failure_reason, created_at, completed_at
        ) VALUES ($1, $2, $3, 'FAILED', 'REJECTED', $4, NOW(), NOW())
      `, [
        crypto.randomUUID(), requestId, attemptNumber, ocrError.message
      ]);

      // Update request status to rejected
      await client.query(
        'UPDATE verification_requests SET status = $1, updated_at = NOW() WHERE id = $2',
        ['REJECTED', requestId]
      );

      throw ocrError;
    }

  } catch (error) {
    console.error(`Verification processing error for ${requestId}:`, error.message);
  } finally {
    client.release();
  }
}

module.exports = router;
