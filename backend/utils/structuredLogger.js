// Structured Logger
// CloudWatch-compatible JSON logging with request correlation

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

const ACTION_TYPES = {
  // Auth
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_REGISTER: 'AUTH_REGISTER',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_TOKEN_REFRESH: 'AUTH_TOKEN_REFRESH',
  
  // Verification
  VERIFICATION_SUBMITTED: 'VERIFICATION_SUBMITTED',
  VERIFICATION_APPROVED: 'VERIFICATION_APPROVED',
  VERIFICATION_REJECTED: 'VERIFICATION_REJECTED',
  VERIFICATION_EXPIRED: 'VERIFICATION_EXPIRED',
  
  // Opportunities
  OPPORTUNITY_CREATED: 'OPPORTUNITY_CREATED',
  OPPORTUNITY_VIEWED: 'OPPORTUNITY_VIEWED',
  OPPORTUNITY_UPDATED: 'OPPORTUNITY_UPDATED',
  OPPORTUNITY_CLOSED: 'OPPORTUNITY_CLOSED',
  
  // Applications
  APPLICATION_SUBMITTED: 'APPLICATION_SUBMITTED',
  APPLICATION_WITHDRAWN: 'APPLICATION_WITHDRAWN',
  APPLICATION_STATUS_UPDATED: 'APPLICATION_STATUS_UPDATED',
  
  // Matching
  MATCHING_EXECUTED: 'MATCHING_EXECUTED',
  MATCHING_FAILED: 'MATCHING_FAILED',
  
  // Premium
  PREMIUM_GATE_BLOCKED: 'PREMIUM_GATE_BLOCKED',
  SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  USAGE_LIMIT_REACHED: 'USAGE_LIMIT_REACHED',
  
  // Profile
  PROFILE_CREATED: 'PROFILE_CREATED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  RESUME_UPLOADED: 'RESUME_UPLOADED',
  
  // System
  DATABASE_ERROR: 'DATABASE_ERROR',
  OCR_FAILED: 'OCR_FAILED',
  EMAIL_FAILED: 'EMAIL_FAILED',
  FILE_PROCESSING_FAILED: 'FILE_PROCESSING_FAILED'
};

class StructuredLogger {
  log(level, action_type, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      action_type,
      request_id: data.request_id || null,
      user_id: data.user_id || null,
      endpoint: data.endpoint || null,
      status: data.status || null,
      latency_ms: data.latency_ms || null,
      error_code: data.error_code || null,
      metadata: data.metadata || {}
    };

    // Output as JSON for CloudWatch
    console.log(JSON.stringify(entry));
  }

  info(action_type, data) {
    this.log(LOG_LEVELS.INFO, action_type, { ...data, status: 'SUCCESS' });
  }

  warn(action_type, data) {
    this.log(LOG_LEVELS.WARN, action_type, data);
  }

  error(action_type, data) {
    this.log(LOG_LEVELS.ERROR, action_type, { ...data, status: 'FAILURE' });
  }
}

// Singleton instance
const logger = new StructuredLogger();

module.exports = { logger, ACTION_TYPES, LOG_LEVELS };
