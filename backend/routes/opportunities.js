// Opportunities API Routes
// Production-grade with comprehensive edge case handling

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getPool } = require('../config/database');
const { authenticateToken, logAudit, isValidUUID, getUserInstitutions } = require('../middleware/identityAuth');
const { canPostOpportunity, canApply, incrementUsage, getActiveSubscription } = require('../middleware/subscription');
const MatchingEngine = require('../services/matchingEngine');
const { uploadDocument, deleteDocument } = require('../services/s3Service');

const router = express.Router();
const pool = getPool();

/**
 * POST /api/opportunities
 * Create new opportunity
 */
router.post('/', authenticateToken, canPostOpportunity, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      title, description, opportunity_type, company_name, location,
      is_remote, job_type, required_skills, min_experience, max_experience,
      required_degree, salary_min, salary_max, currency, visibility, expires_at
    } = req.body;

    // Validation
    if (!title || !description || !opportunity_type || !company_name) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user's active institution
    const institutions = await getUserInstitutions(req.user.id);
    if (institutions.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'No verified institution found' });
    }

    const institutionId = institutions[0].institution_id;

    // Create opportunity
    const opportunityId = uuidv4();
    await client.query(`
      INSERT INTO opportunities (
        id, posted_by, institution_id, title, description, opportunity_type,
        company_name, location, is_remote, job_type, required_skills,
        min_experience, max_experience, required_degree, salary_min, salary_max,
        currency, visibility, expires_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'open')
    `, [
      opportunityId, req.user.id, institutionId, title, description, opportunity_type,
      company_name, location, is_remote || false, job_type, required_skills,
      min_experience, max_experience, required_degree, salary_min, salary_max,
      currency || 'USD', visibility || 'institution', expires_at
    ]);

    // Increment usage counter
    await incrementUsage(req.user.id, 'opportunity');

    // Audit log
    await logAudit({
      user_id: req.user.id,
      action: 'OPPORTUNITY_CREATED',
      entity_type: 'opportunity',
      entity_id: opportunityId,
      metadata: { title, opportunity_type, visibility },
      req
    });

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      opportunity_id: opportunityId,
      message: 'Opportunity created successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create opportunity error:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/opportunities/feed
 * Get institution-scoped opportunity feed
 */
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, location, remote_only } = req.query;
    const offset = (page - 1) * limit;

    // Get user's institutions and verification status
    const institutions = await getUserInstitutions(req.user.id);
    const subscription = await getActiveSubscription(req.user.id);

    // Determine visibility based on subscription and verification
    let visibilityFilter = [];
    
    if (institutions.length > 0) {
      // Verified user - can see institution-specific opportunities
      const institutionIds = institutions.map(i => i.institution_id);
      visibilityFilter.push(`(visibility = 'institution' AND institution_id = ANY($1))`);
      
      if (subscription.can_see_verified_feed) {
        visibilityFilter.push(`visibility = 'verified'`);
      }
    }
    
    if (subscription.can_see_public_feed) {
      visibilityFilter.push(`visibility = 'public'`);
    }

    if (visibilityFilter.length === 0) {
      // No access to any feed
      return res.json({ opportunities: [], total: 0, page, limit });
    }

    // Build query
    let query = `
      SELECT o.*, 
             u.first_name || ' ' || u.last_name as posted_by_name,
             i.name as institution_name
      FROM opportunities o
      JOIN users u ON o.posted_by = u.id
      JOIN institutions i ON o.institution_id = i.id
      WHERE o.status = 'open'
        AND (o.expires_at IS NULL OR o.expires_at > CURRENT_TIMESTAMP)
        AND (${visibilityFilter.join(' OR ')})
    `;

    const params = [institutions.map(i => i.institution_id)];
    let paramIndex = 2;

    // Filters
    if (type) {
      query += ` AND o.opportunity_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (location) {
      query += ` AND o.location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    if (remote_only === 'true') {
      query += ` AND o.is_remote = TRUE`;
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) FROM opportunities o
      WHERE o.status = 'open'
        AND (o.expires_at IS NULL OR o.expires_at > CURRENT_TIMESTAMP)
        AND (${visibilityFilter.join(' OR ')})
    `;
    const countResult = await pool.query(countQuery, [institutions.map(i => i.institution_id)]);

    res.json({
      opportunities: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

/**
 * GET /api/opportunities/:id
 * Get single opportunity with access control
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ error: 'Invalid opportunity ID' });
    }

    const institutions = await getUserInstitutions(req.user.id);
    const subscription = await getActiveSubscription(req.user.id);

    // Check visibility access
    let visibilityFilter = [];
    if (institutions.length > 0) {
      const institutionIds = institutions.map(i => i.institution_id);
      visibilityFilter.push(`(o.visibility = 'institution' AND o.institution_id = ANY($2))`);
      if (subscription.can_see_verified_feed) {
        visibilityFilter.push(`o.visibility = 'verified'`);
      }
    }
    if (subscription.can_see_public_feed) {
      visibilityFilter.push(`o.visibility = 'public'`);
    }

    if (visibilityFilter.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      SELECT o.*, 
             u.first_name || ' ' || u.last_name as posted_by_name,
             i.name as institution_name,
             EXISTS(SELECT 1 FROM applications WHERE opportunity_id = o.id AND applicant_id = $3) as has_applied
      FROM opportunities o
      JOIN users u ON o.posted_by = u.id
      JOIN institutions i ON o.institution_id = i.id
      WHERE o.id = $1 AND (${visibilityFilter.join(' OR ')})
    `, [req.params.id, institutions.map(i => i.institution_id), req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found or access denied' });
    }

    // Increment view count
    await pool.query(`
      UPDATE opportunities SET view_count = view_count + 1 WHERE id = $1
    `, [req.params.id]);

    res.json({ opportunity: result.rows[0] });

  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

/**
 * POST /api/opportunities/:id/apply
 * Apply to opportunity with comprehensive edge case handling
 */
router.post('/:id/apply', authenticateToken, canApply, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    if (!isValidUUID(req.params.id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid opportunity ID' });
    }

    const { cover_letter } = req.body;
    const opportunityId = req.params.id;

    // EDGE CASE: Check if opportunity exists and is open
    const oppResult = await client.query(`
      SELECT * FROM opportunities
      WHERE id = $1
      FOR UPDATE  -- Lock row to prevent race conditions
    `, [opportunityId]);

    if (oppResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const opportunity = oppResult.rows[0];

    // EDGE CASE: Opportunity closed mid-apply
    if (opportunity.status !== 'open') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Opportunity is no longer open' });
    }

    // EDGE CASE: Opportunity expired
    if (opportunity.expires_at && new Date(opportunity.expires_at) < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Opportunity has expired' });
    }

    // EDGE CASE: Applying to own opportunity
    if (opportunity.posted_by === req.user.id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot apply to your own opportunity' });
    }

    // EDGE CASE: Check verification status
    const institutions = await getUserInstitutions(req.user.id);
    if (opportunity.visibility === 'institution' || opportunity.visibility === 'verified') {
      if (institutions.length === 0) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Verification required to apply' });
      }

      // EDGE CASE: Verification expired mid-request
      const activeInstitution = institutions.find(i => 
        i.is_active && new Date(i.expires_at) > new Date()
      );
      if (!activeInstitution) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Verification expired' });
      }
    }

    // EDGE CASE: Duplicate application
    const existingApp = await client.query(`
      SELECT id FROM applications
      WHERE opportunity_id = $1 AND applicant_id = $2
    `, [opportunityId, req.user.id]);

    if (existingApp.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Already applied to this opportunity' });
    }

    // EDGE CASE: Get talent profile (required for matching)
    const profileResult = await client.query(`
      SELECT * FROM talent_profiles WHERE user_id = $1
    `, [req.user.id]);

    if (profileResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Talent profile required. Please complete your profile first.' });
    }

    const talentProfile = profileResult.rows[0];

    // EDGE CASE: User opted out of matching
    if (!talentProfile.is_open_to_opportunities) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Profile is not open to opportunities' });
    }

    // Calculate match score (deterministic)
    const matchResult = MatchingEngine.calculateMatch(talentProfile, opportunity);

    // Create application
    const applicationId = uuidv4();
    await client.query(`
      INSERT INTO applications (
        id, opportunity_id, applicant_id, cover_letter,
        resume_s3_key, resume_text, match_score, match_breakdown, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'submitted')
    `, [
      applicationId,
      opportunityId,
      req.user.id,
      cover_letter,
      talentProfile.resume_s3_key,
      talentProfile.resume_text,
      matchResult.score,
      JSON.stringify(matchResult.breakdown)
    ]);

    // Increment application count
    await client.query(`
      UPDATE opportunities SET application_count = application_count + 1
      WHERE id = $1
    `, [opportunityId]);

    // Increment usage counter
    await incrementUsage(req.user.id, 'application');

    // Audit log
    await logAudit({
      user_id: req.user.id,
      action: 'APPLICATION_SUBMITTED',
      entity_type: 'application',
      entity_id: applicationId,
      metadata: { opportunity_id: opportunityId, match_score: matchResult.score },
      req
    });

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      application_id: applicationId,
      match_score: matchResult.score,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Apply error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/opportunities/my-posts
 * Get user's posted opportunities
 */
router.get('/my-posts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, i.name as institution_name
      FROM opportunities o
      JOIN institutions i ON o.institution_id = i.id
      WHERE o.posted_by = $1
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.json({ opportunities: result.rows });

  } catch (error) {
    console.error('My posts error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

/**
 * GET /api/opportunities/:id/applications
 * Get applications for posted opportunity (owner only)
 */
router.get('/:id/applications', authenticateToken, async (req, res) => {
  try {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ error: 'Invalid opportunity ID' });
    }

    // Verify ownership
    const oppResult = await pool.query(`
      SELECT posted_by FROM opportunities WHERE id = $1
    `, [req.params.id]);

    if (oppResult.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    if (oppResult.rows[0].posted_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get applications
    const result = await pool.query(`
      SELECT a.*,
             u.first_name || ' ' || u.last_name as applicant_name,
             u.email as applicant_email,
             tp.headline, tp.location, tp.years_of_experience
      FROM applications a
      JOIN users u ON a.applicant_id = u.id
      LEFT JOIN talent_profiles tp ON tp.user_id = u.id
      WHERE a.opportunity_id = $1
      ORDER BY a.match_score DESC, a.submitted_at DESC
    `, [req.params.id]);

    res.json({ applications: result.rows });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

module.exports = router;
