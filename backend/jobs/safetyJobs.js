// Background Safety Jobs
// Idempotent cleanup and expiry jobs

const { getPool } = require('../config/database');
const { logger, ACTION_TYPES } = require('../utils/structuredLogger');

const pool = getPool();

/**
 * Expire inactive verifications
 * Safe to rerun - idempotent
 */
async function expireVerifications() {
  const job_id = `expire_verifications_${Date.now()}`;
  
  try {
    logger.info(ACTION_TYPES.VERIFICATION_EXPIRED, {
      metadata: { job_id, job_type: 'expire_verifications' }
    });

    const result = await pool.query(`
      UPDATE user_verifications
      SET is_active = false
      WHERE is_active = true
        AND expires_at < CURRENT_TIMESTAMP
      RETURNING id, user_id, institution_id
    `);

    logger.info(ACTION_TYPES.VERIFICATION_EXPIRED, {
      metadata: { 
        job_id,
        expired_count: result.rows.length,
        verification_ids: result.rows.map(r => r.id)
      }
    });

    return { success: true, expired_count: result.rows.length };

  } catch (error) {
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      error_code: 'JOB_FAILED',
      metadata: { 
        job_id,
        job_type: 'expire_verifications',
        error: error.message,
        stack: error.stack
      }
    });
    
    return { success: false, error: error.message };
  }
}

/**
 * Expire inactive subscriptions
 * Safe to rerun - idempotent
 */
async function expireSubscriptions() {
  const job_id = `expire_subscriptions_${Date.now()}`;
  
  try {
    logger.info(ACTION_TYPES.SUBSCRIPTION_EXPIRED, {
      metadata: { job_id, job_type: 'expire_subscriptions' }
    });

    const result = await pool.query(`
      UPDATE subscriptions
      SET is_active = false
      WHERE is_active = true
        AND expires_at < CURRENT_TIMESTAMP
      RETURNING id, user_id, plan_type
    `);

    logger.info(ACTION_TYPES.SUBSCRIPTION_EXPIRED, {
      metadata: { 
        job_id,
        expired_count: result.rows.length,
        subscription_ids: result.rows.map(r => r.id)
      }
    });

    return { success: true, expired_count: result.rows.length };

  } catch (error) {
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      error_code: 'JOB_FAILED',
      metadata: { 
        job_id,
        job_type: 'expire_subscriptions',
        error: error.message,
        stack: error.stack
      }
    });
    
    return { success: false, error: error.message };
  }
}

/**
 * Close expired opportunities
 * Safe to rerun - idempotent
 */
async function closeExpiredOpportunities() {
  const job_id = `close_opportunities_${Date.now()}`;
  
  try {
    logger.info(ACTION_TYPES.OPPORTUNITY_CLOSED, {
      metadata: { job_id, job_type: 'close_expired_opportunities' }
    });

    const result = await pool.query(`
      UPDATE opportunities
      SET status = 'closed'
      WHERE status = 'active'
        AND expires_at < CURRENT_TIMESTAMP
      RETURNING id, posted_by, title
    `);

    logger.info(ACTION_TYPES.OPPORTUNITY_CLOSED, {
      metadata: { 
        job_id,
        closed_count: result.rows.length,
        opportunity_ids: result.rows.map(r => r.id)
      }
    });

    return { success: true, closed_count: result.rows.length };

  } catch (error) {
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      error_code: 'JOB_FAILED',
      metadata: { 
        job_id,
        job_type: 'close_expired_opportunities',
        error: error.message,
        stack: error.stack
      }
    });
    
    return { success: false, error: error.message };
  }
}

/**
 * Reset monthly usage counters
 * Safe to rerun - idempotent (checks last_reset_at)
 */
async function resetMonthlyUsage() {
  const job_id = `reset_usage_${Date.now()}`;
  
  try {
    logger.info('USAGE_RESET', {
      metadata: { job_id, job_type: 'reset_monthly_usage' }
    });

    const result = await pool.query(`
      UPDATE subscriptions
      SET opportunities_posted_this_month = 0,
          applications_submitted_this_month = 0,
          last_reset_at = CURRENT_TIMESTAMP
      WHERE last_reset_at < date_trunc('month', CURRENT_TIMESTAMP)
         OR last_reset_at IS NULL
      RETURNING id, user_id
    `);

    logger.info('USAGE_RESET', {
      metadata: { 
        job_id,
        reset_count: result.rows.length
      }
    });

    return { success: true, reset_count: result.rows.length };

  } catch (error) {
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      error_code: 'JOB_FAILED',
      metadata: { 
        job_id,
        job_type: 'reset_monthly_usage',
        error: error.message,
        stack: error.stack
      }
    });
    
    return { success: false, error: error.message };
  }
}

/**
 * Run all safety jobs
 */
async function runSafetyJobs() {
  logger.info('SAFETY_JOBS_START', {
    metadata: { timestamp: new Date().toISOString() }
  });

  const results = await Promise.allSettled([
    expireVerifications(),
    expireSubscriptions(),
    closeExpiredOpportunities(),
    resetMonthlyUsage()
  ]);

  logger.info('SAFETY_JOBS_COMPLETE', {
    metadata: { 
      results: results.map((r, i) => ({
        job: ['verifications', 'subscriptions', 'opportunities', 'usage'][i],
        status: r.status,
        value: r.value
      }))
    }
  });
}

module.exports = {
  expireVerifications,
  expireSubscriptions,
  closeExpiredOpportunities,
  resetMonthlyUsage,
  runSafetyJobs
};
