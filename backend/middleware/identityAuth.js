const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { logger, ACTION_TYPES } = require('../utils/structuredLogger');
const { AppError } = require('../utils/errors');
const metrics = require('../utils/metrics');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Audit logging utility - immutable action tracking
 */
async function logAudit({ user_id, action, entity_type = null, entity_id = null, metadata = {}, req = null }) {
  try {
    const ip_address = req?.ip || req?.connection?.remoteAddress || null;
    const user_agent = req?.get('User-Agent') || null;
    const request_id = req?.context?.request_id || null;
    
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [user_id, action, entity_type, entity_id, JSON.stringify(metadata), ip_address, user_agent]);
    
    logger.info('AUDIT_LOG_CREATED', {
      request_id,
      user_id,
      metadata: { action, entity_type, entity_id }
    });
  } catch (error) {
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      request_id: req?.context?.request_id,
      error_code: 'AUDIT_LOG_FAILED',
      metadata: { error: error.message }
    });
    // Never fail the main operation due to audit logging
  }
}

/**
 * Hardened JWT authentication middleware
 * Enforces immutable user_id as sole identity anchor
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const request_id = req.context?.request_id;

  metrics.increment('auth_attempts_total');

  if (!token) {
    metrics.increment('auth_failures_total');
    return next(new AppError('AUTH_MISSING_TOKEN', 'No token provided', { request_id }));
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      metrics.increment('auth_failures_total');
      
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('AUTH_EXPIRED', 'Token expired', { request_id }));
      }
      return next(new AppError('AUTH_INVALID_TOKEN', 'Token verification failed', { request_id }));
    }

    // Strict JWT payload validation
    if (!decoded.sub || typeof decoded.sub !== 'string') {
      metrics.increment('auth_failures_total');
      return next(new AppError('AUTH_INVALID_TOKEN', 'Invalid token payload', { request_id }));
    }

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(decoded.sub)) {
      metrics.increment('auth_failures_total');
      return next(new AppError('INVALID_UUID', 'Invalid user identifier format', { request_id }));
    }

    try {
      // Verify user exists and is active
      const result = await pool.query(
        'SELECT id, email, is_email_verified FROM users WHERE id = $1',
        [decoded.sub]
      );

      if (result.rows.length === 0) {
        metrics.increment('auth_failures_total');
        return next(new AppError('AUTH_INVALID_TOKEN', 'User not found', { request_id }));
      }

      // Attach minimal user context
      req.user = {
        id: decoded.sub,
        role: decoded.role || 'user',
        email: result.rows[0].email,
        is_email_verified: result.rows[0].is_email_verified
      };

      logger.info(ACTION_TYPES.AUTH_LOGIN, {
        request_id,
        user_id: req.user.id,
        endpoint: `${req.method} ${req.path}`
      });

      next();
    } catch (dbError) {
      metrics.increment('auth_failures_total');
      logger.error(ACTION_TYPES.DATABASE_ERROR, {
        request_id,
        error_code: 'DATABASE_CONNECTION_FAILED',
        metadata: { error: dbError.message, stack: dbError.stack }
      });
      return next(new AppError('DATABASE_CONNECTION_FAILED', 'Auth database query failed', { request_id }));
    }
  });
}

/**
 * Generate hardened JWT token
 */
function generateToken(user_id, role = 'user') {
  const payload = {
    sub: user_id,
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Get user's active institutions
 */
async function getUserInstitutions(user_id) {
  const result = await pool.query(`
    SELECT ui.*, i.name as institution_name, i.domain
    FROM user_institutions ui
    JOIN institutions i ON ui.institution_id = i.id
    WHERE ui.user_id = $1 AND ui.is_active = TRUE
    ORDER BY ui.created_at DESC
  `, [user_id]);
  
  return result.rows;
}

module.exports = {
  authenticateToken,
  generateToken,
  logAudit,
  isValidUUID,
  getUserInstitutions
};
