// Subscription Middleware - Premium Access Enforcement
// Checks user subscription and enforces limits

const { getPool } = require('../config/database');
const { logAudit } = require('./identityAuth');
const { logger, ACTION_TYPES } = require('../utils/structuredLogger');
const { AppError } = require('../utils/errors');
const metrics = require('../utils/metrics');

const pool = getPool();

/**
 * Get active subscription for user
 */
async function getActiveSubscription(userId) {
  const result = await pool.query(`
    SELECT * FROM subscriptions
    WHERE user_id = $1 
      AND is_active = TRUE
      AND expires_at > CURRENT_TIMESTAMP
    ORDER BY expires_at DESC
    LIMIT 1
  `, [userId]);

  if (result.rows.length === 0) {
    // Return free tier defaults
    return {
      plan_type: 'free',
      max_opportunities_per_month: 0,
      max_applications_per_month: 5,
      can_see_verified_feed: false,
      can_see_public_feed: true,
      can_post_opportunities: false,
      can_access_matching: false,
      opportunities_posted_this_month: 0,
      applications_submitted_this_month: 0
    };
  }

  return result.rows[0];
}

/**
 * Middleware: Require premium subscription
 */
async function requirePremium(req, res, next) {
  try {
    const subscription = await getActiveSubscription(req.user.id);
    
    if (subscription.plan_type === 'free') {
      return res.status(403).json({ 
        error: 'Premium subscription required',
        upgrade_url: '/pricing'
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    const request_id = req.context?.request_id;
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      request_id,
      error_code: 'DATABASE_CONNECTION_FAILED',
      metadata: { 
        error: error.message, 
        stack: error.stack,
        middleware: 'getActiveSubscription'
      }
    });
    return next(new AppError('DATABASE_CONNECTION_FAILED', 'Subscription verification service temporarily unavailable', { request_id }));
  }
}

/**
 * Middleware: Check if user can post opportunities
 */
async function canPostOpportunity(req, res, next) {
  try {
    const subscription = await getActiveSubscription(req.user.id);
    
    if (!subscription.can_post_opportunities) {
      return res.status(403).json({ 
        error: 'Your plan does not allow posting opportunities',
        current_plan: subscription.plan_type
      });
    }

    // Check monthly limit
    if (subscription.max_opportunities_per_month !== null) {
      if (subscription.opportunities_posted_this_month >= subscription.max_opportunities_per_month) {
        return res.status(429).json({ 
          error: 'Monthly opportunity posting limit reached',
          limit: subscription.max_opportunities_per_month,
          used: subscription.opportunities_posted_this_month
        });
      }
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    const request_id = req.context?.request_id;
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      request_id,
      error_code: 'DATABASE_CONNECTION_FAILED',
      metadata: { 
        error: error.message, 
        stack: error.stack,
        middleware: 'canPostOpportunity'
      }
    });
    return next(new AppError('DATABASE_CONNECTION_FAILED', 'Posting permission verification service temporarily unavailable', { request_id }));
  }
}

/**
 * Middleware: Check if user can apply
 */
async function canApply(req, res, next) {
  try {
    const subscription = await getActiveSubscription(req.user.id);
    
    // Check monthly limit
    if (subscription.max_applications_per_month !== null) {
      if (subscription.applications_submitted_this_month >= subscription.max_applications_per_month) {
        return res.status(429).json({ 
          error: 'Monthly application limit reached',
          limit: subscription.max_applications_per_month,
          used: subscription.applications_submitted_this_month
        });
      }
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    const request_id = req.context?.request_id;
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      request_id,
      error_code: 'DATABASE_CONNECTION_FAILED',
      metadata: { 
        error: error.message, 
        stack: error.stack,
        middleware: 'canApply'
      }
    });
    return next(new AppError('DATABASE_CONNECTION_FAILED', 'Application permission verification service temporarily unavailable', { request_id }));
  }
}

/**
 * Increment usage counter
 */
async function incrementUsage(userId, type) {
  const field = type === 'opportunity' 
    ? 'opportunities_posted_this_month' 
    : 'applications_submitted_this_month';

  await pool.query(`
    UPDATE subscriptions
    SET ${field} = ${field} + 1
    WHERE user_id = $1 AND is_active = TRUE
  `, [userId]);
}

module.exports = {
  getActiveSubscription,
  requirePremium,
  canPostOpportunity,
  canApply,
  incrementUsage
};
