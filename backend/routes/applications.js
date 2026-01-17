// Applications API Routes
// Track and manage applications

const express = require('express');
const { getPool } = require('../config/database');
const { authenticateToken, logAudit, isValidUUID } = require('../middleware/identityAuth');
const { AppError } = require('../utils/errors');
const { logger, ACTION_TYPES } = require('../utils/structuredLogger');
const metrics = require('../utils/metrics');

const router = express.Router();
const pool = getPool();

/**
 * GET /api/applications/my-applications
 * Get user's submitted applications
 */
router.get('/my-applications', authenticateToken, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*,
             o.title as opportunity_title,
             o.company_name,
             o.status as opportunity_status,
             i.name as institution_name
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      JOIN institutions i ON o.institution_id = i.id
      WHERE a.applicant_id = $1
    `;

    const params = [req.user.id];
    let paramIndex = 2;

    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY a.submitted_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM applications WHERE applicant_id = $1`;
    const countParams = [req.user.id];
    if (status) {
      countQuery += ` AND status = $2`;
      countParams.push(status);
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      applications: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    const request_id = req.context?.request_id;
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      request_id,
      error_code: 'DATABASE_CONNECTION_FAILED',
      metadata: { 
        error: error.message, 
        stack: error.stack,
        endpoint: 'GET /api/applications'
      }
    });
    return next(new AppError('DATABASE_CONNECTION_FAILED', 'Application listing service temporarily unavailable', { request_id }));
  }
});

/**
 * GET /api/applications/:id
 * Get single application details
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    if (!isValidUUID(req.params.id)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    const result = await pool.query(`
      SELECT a.*,
             o.title as opportunity_title,
             o.description as opportunity_description,
             o.company_name,
             i.name as institution_name
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      JOIN institutions i ON o.institution_id = i.id
      WHERE a.id = $1 AND a.applicant_id = $2
    `, [req.params.id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ application: result.rows[0] });

  } catch (error) {
    const request_id = req.context?.request_id;
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      request_id,
      error_code: 'DATABASE_CONNECTION_FAILED',
      metadata: { 
        error: error.message, 
        stack: error.stack,
        endpoint: 'GET /api/applications/:id'
      }
    });
    return next(new AppError('DATABASE_CONNECTION_FAILED', 'Application detail service temporarily unavailable', { request_id }));
  }
});

/**
 * PUT /api/applications/:id/withdraw
 * Withdraw application
 */
router.put('/:id/withdraw', authenticateToken, async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    if (!isValidUUID(req.params.id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    // Check ownership and current status
    const result = await client.query(`
      SELECT * FROM applications
      WHERE id = $1 AND applicant_id = $2
      FOR UPDATE
    `, [req.params.id, req.user.id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = result.rows[0];

    // Can only withdraw if not already processed
    if (['accepted', 'rejected', 'withdrawn'].includes(application.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Cannot withdraw application in current status',
        current_status: application.status
      });
    }

    // Update status
    await client.query(`
      UPDATE applications
      SET status = 'withdrawn', status_updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [req.params.id]);

    // Record status change
    await client.query(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by)
      VALUES ($1, $2, 'withdrawn', $3)
    `, [req.params.id, application.status, req.user.id]);

    // Decrement application count
    await client.query(`
      UPDATE opportunities SET application_count = application_count - 1
      WHERE id = $1 AND application_count > 0
    `, [application.opportunity_id]);

    // Audit log
    await logAudit({
      user_id: req.user.id,
      action: 'APPLICATION_WITHDRAWN',
      entity_type: 'application',
      entity_id: req.params.id,
      metadata: { opportunity_id: application.opportunity_id },
      req
    });

    await client.query('COMMIT');

    res.json({ success: true, message: 'Application withdrawn successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    const request_id = req.context?.request_id;
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      request_id,
      error_code: 'DATABASE_CONNECTION_FAILED',
      metadata: { 
        error: error.message, 
        stack: error.stack,
        endpoint: 'DELETE /api/applications/:id'
      }
    });
    return next(new AppError('DATABASE_CONNECTION_FAILED', 'Application withdrawal service temporarily unavailable', { request_id }));
  } finally {
    client.release();
  }
});

/**
 * PUT /api/applications/:id/status
 * Update application status (opportunity owner only)
 */
router.put('/:id/status', authenticateToken, async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    if (!isValidUUID(req.params.id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    const { status, notes } = req.body;

    if (!['reviewed', 'shortlisted', 'rejected', 'accepted'].includes(status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get application and verify ownership of opportunity
    const result = await client.query(`
      SELECT a.*, o.posted_by
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.id = $1
      FOR UPDATE
    `, [req.params.id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = result.rows[0];

    // Verify ownership
    if (application.posted_by !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update status
    await client.query(`
      UPDATE applications
      SET status = $1, 
          status_updated_at = CURRENT_TIMESTAMP,
          reviewed_at = CASE WHEN reviewed_at IS NULL THEN CURRENT_TIMESTAMP ELSE reviewed_at END
      WHERE id = $2
    `, [status, req.params.id]);

    // Record status change
    await client.query(`
      INSERT INTO application_status_history (application_id, old_status, new_status, changed_by, notes)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.params.id, application.status, status, req.user.id, notes]);

    // Audit log
    await logAudit({
      user_id: req.user.id,
      action: 'APPLICATION_STATUS_UPDATED',
      entity_type: 'application',
      entity_id: req.params.id,
      metadata: { old_status: application.status, new_status: status },
      req
    });

    await client.query('COMMIT');

    res.json({ success: true, message: 'Application status updated' });

  } catch (error) {
    await client.query('ROLLBACK');
    const request_id = req.context?.request_id;
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      request_id,
      error_code: 'DATABASE_CONNECTION_FAILED',
      metadata: { 
        error: error.message, 
        stack: error.stack,
        endpoint: 'PUT /api/applications/:id/status'
      }
    });
    return next(new AppError('DATABASE_CONNECTION_FAILED', 'Application status update service temporarily unavailable', { request_id }));
  } finally {
    client.release();
  }
});

module.exports = router;
