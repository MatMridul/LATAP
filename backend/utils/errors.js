// Error Taxonomy
// Typed errors with deterministic error codes

const ERROR_CODES = {
  // Auth
  AUTH_EXPIRED: { code: 'AUTH_EXPIRED', status: 401, message: 'Authentication expired' },
  AUTH_INVALID_TOKEN: { code: 'AUTH_INVALID_TOKEN', status: 401, message: 'Invalid authentication token' },
  AUTH_MISSING_TOKEN: { code: 'AUTH_MISSING_TOKEN', status: 401, message: 'Authentication required' },
  AUTH_INVALID_CREDENTIALS: { code: 'AUTH_INVALID_CREDENTIALS', status: 401, message: 'Invalid credentials' },
  EMAIL_NOT_VERIFIED: { code: 'EMAIL_NOT_VERIFIED', status: 401, message: 'Please verify your email before logging in' },
  
  // Verification
  VERIFICATION_INACTIVE: { code: 'VERIFICATION_INACTIVE', status: 403, message: 'Verification not active' },
  VERIFICATION_EXPIRED: { code: 'VERIFICATION_EXPIRED', status: 403, message: 'Verification expired' },
  VERIFICATION_NOT_FOUND: { code: 'VERIFICATION_NOT_FOUND', status: 404, message: 'Verification not found' },
  VERIFICATION_ALREADY_EXISTS: { code: 'VERIFICATION_ALREADY_EXISTS', status: 409, message: 'Verification already submitted' },
  
  // Subscription
  SUBSCRIPTION_EXPIRED: { code: 'SUBSCRIPTION_EXPIRED', status: 403, message: 'Subscription expired' },
  SUBSCRIPTION_LIMIT_REACHED: { code: 'SUBSCRIPTION_LIMIT_REACHED', status: 429, message: 'Monthly limit reached' },
  SUBSCRIPTION_REQUIRED: { code: 'SUBSCRIPTION_REQUIRED', status: 403, message: 'Premium subscription required' },
  
  // Opportunities
  OPPORTUNITY_NOT_FOUND: { code: 'OPPORTUNITY_NOT_FOUND', status: 404, message: 'Opportunity not found' },
  OPPORTUNITY_NOT_ACTIVE: { code: 'OPPORTUNITY_NOT_ACTIVE', status: 400, message: 'Opportunity not active' },
  OPPORTUNITY_EXPIRED: { code: 'OPPORTUNITY_EXPIRED', status: 400, message: 'Opportunity expired' },
  OPPORTUNITY_ACCESS_DENIED: { code: 'OPPORTUNITY_ACCESS_DENIED', status: 403, message: 'Access denied' },
  
  // Applications
  DUPLICATE_APPLICATION: { code: 'DUPLICATE_APPLICATION', status: 409, message: 'Already applied to this opportunity' },
  APPLY_TO_OWN_OPPORTUNITY: { code: 'APPLY_TO_OWN_OPPORTUNITY', status: 400, message: 'Cannot apply to own opportunity' },
  APPLICATION_NOT_FOUND: { code: 'APPLICATION_NOT_FOUND', status: 404, message: 'Application not found' },
  APPLICATION_INVALID_STATUS: { code: 'APPLICATION_INVALID_STATUS', status: 400, message: 'Invalid application status' },
  
  // Profile
  TALENT_PROFILE_MISSING: { code: 'TALENT_PROFILE_MISSING', status: 400, message: 'Talent profile required' },
  TALENT_PROFILE_NOT_OPEN: { code: 'TALENT_PROFILE_NOT_OPEN', status: 400, message: 'Candidate not open to opportunities' },
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: { code: 'RATE_LIMIT_EXCEEDED', status: 429, message: 'Rate limit exceeded' },
  
  // System
  DATABASE_TRANSACTION_FAILED: { code: 'DATABASE_TRANSACTION_FAILED', status: 500, message: 'Transaction failed' },
  DATABASE_CONNECTION_FAILED: { code: 'DATABASE_CONNECTION_FAILED', status: 500, message: 'Database connection failed' },
  FILE_PROCESSING_FAILED: { code: 'FILE_PROCESSING_FAILED', status: 500, message: 'File processing failed' },
  OCR_FAILED: { code: 'OCR_FAILED', status: 500, message: 'OCR processing failed' },
  EMAIL_SEND_FAILED: { code: 'EMAIL_SEND_FAILED', status: 500, message: 'Email delivery failed' },
  
  // Validation
  INVALID_INPUT: { code: 'INVALID_INPUT', status: 400, message: 'Invalid input' },
  INVALID_UUID: { code: 'INVALID_UUID', status: 400, message: 'Invalid ID format' },
  MISSING_REQUIRED_FIELD: { code: 'MISSING_REQUIRED_FIELD', status: 400, message: 'Required field missing' }
};

class AppError extends Error {
  constructor(errorCode, internalMessage = null, metadata = {}) {
    const errorDef = ERROR_CODES[errorCode];
    
    if (!errorDef) {
      throw new Error(`Unknown error code: ${errorCode}`);
    }
    
    super(errorDef.message);
    
    this.error_code = errorDef.code;
    this.http_status = errorDef.status;
    this.safe_message = errorDef.message;
    this.internal_message = internalMessage || errorDef.message;
    this.metadata = metadata;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError, ERROR_CODES };
