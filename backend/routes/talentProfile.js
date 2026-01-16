// Talent Profile API Routes
// Manage user talent profiles for matching

const express = require('express');
const multer = require('multer');
const { getPool } = require('../config/database');
const { authenticateToken, logAudit } = require('../middleware/identityAuth');
const { uploadDocument, deleteDocument } = require('../services/s3Service');
const TextractService = require('../verification/ocr/TextractService');

const router = express.Router();
const pool = getPool();

// Configure multer for resume uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  }
});

/**
 * GET /api/talent-profile
 * Get user's talent profile
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM talent_profiles WHERE user_id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile: result.rows[0] });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * POST /api/talent-profile
 * Create or update talent profile
 */
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      headline, bio, location, skills, years_of_experience,
      current_role, current_company, highest_degree, field_of_study,
      job_types, preferred_locations, remote_preference,
      expected_salary_min, expected_salary_max,
      is_searchable, is_open_to_opportunities
    } = req.body;

    // Check if profile exists
    const existing = await client.query(`
      SELECT id FROM talent_profiles WHERE user_id = $1
    `, [req.user.id]);

    if (existing.rows.length > 0) {
      // Update
      await client.query(`
        UPDATE talent_profiles SET
          headline = $1, bio = $2, location = $3, skills = $4,
          years_of_experience = $5, current_role = $6, current_company = $7,
          highest_degree = $8, field_of_study = $9, job_types = $10,
          preferred_locations = $11, remote_preference = $12,
          expected_salary_min = $13, expected_salary_max = $14,
          is_searchable = $15, is_open_to_opportunities = $16,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $17
      `, [
        headline, bio, location, skills, years_of_experience,
        current_role, current_company, highest_degree, field_of_study,
        job_types, preferred_locations, remote_preference,
        expected_salary_min, expected_salary_max,
        is_searchable, is_open_to_opportunities, req.user.id
      ]);
    } else {
      // Create
      await client.query(`
        INSERT INTO talent_profiles (
          user_id, headline, bio, location, skills, years_of_experience,
          current_role, current_company, highest_degree, field_of_study,
          job_types, preferred_locations, remote_preference,
          expected_salary_min, expected_salary_max,
          is_searchable, is_open_to_opportunities
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        req.user.id, headline, bio, location, skills, years_of_experience,
        current_role, current_company, highest_degree, field_of_study,
        job_types, preferred_locations, remote_preference,
        expected_salary_min, expected_salary_max,
        is_searchable, is_open_to_opportunities
      ]);
    }

    // Audit log
    await logAudit({
      user_id: req.user.id,
      action: existing.rows.length > 0 ? 'PROFILE_UPDATED' : 'PROFILE_CREATED',
      entity_type: 'talent_profile',
      entity_id: req.user.id,
      metadata: { is_searchable, is_open_to_opportunities },
      req
    });

    await client.query('COMMIT');

    res.json({ success: true, message: 'Profile saved successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Save profile error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  } finally {
    client.release();
  }
});

/**
 * POST /api/talent-profile/resume
 * Upload resume with OCR extraction
 */
router.post('/resume', authenticateToken, upload.single('resume'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    if (!req.file) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Resume file required' });
    }

    // Upload to S3
    const { key } = await uploadDocument(
      req.file.buffer,
      req.file.originalname,
      req.user.id
    );

    // Extract text with OCR (optional - can be async)
    let resumeText = null;
    try {
      const textractService = new TextractService();
      const ocrResult = await textractService.extractTextFromBuffer(req.file.buffer);
      if (ocrResult.success) {
        resumeText = ocrResult.rawText;
      }
    } catch (ocrError) {
      console.error('OCR extraction failed:', ocrError);
      // Continue without OCR text - not critical
    }

    // Update profile
    await client.query(`
      INSERT INTO talent_profiles (user_id, resume_s3_key, resume_text, resume_uploaded_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        resume_s3_key = $2,
        resume_text = $3,
        resume_uploaded_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `, [req.user.id, key, resumeText]);

    // Audit log
    await logAudit({
      user_id: req.user.id,
      action: 'RESUME_UPLOADED',
      entity_type: 'talent_profile',
      entity_id: req.user.id,
      metadata: { s3_key: key, ocr_success: !!resumeText },
      req
    });

    await client.query('COMMIT');

    res.json({ 
      success: true, 
      message: 'Resume uploaded successfully',
      ocr_extracted: !!resumeText
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  } finally {
    client.release();
  }
});

module.exports = router;
