// Global Error Handler
// Catches all errors and logs with structured format

const { logger, ACTION_TYPES } = require('../utils/structuredLogger');
const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  const request_id = req.context?.request_id || null;
  const user_id = req.user?.id || null;
  const endpoint = `${req.method} ${req.path}`;
  const latency_ms = req.context?.start_time ? Date.now() - req.context.start_time : null;

  // Handle AppError (typed errors)
  if (err instanceof AppError) {
    logger.error(ACTION_TYPES.DATABASE_ERROR, {
      request_id,
      user_id,
      endpoint,
      latency_ms,
      error_code: err.error_code,
      metadata: {
        internal_message: err.internal_message,
        ...err.metadata
      }
    });

    return res.status(err.http_status).json({
      error: err.safe_message,
      error_code: err.error_code,
      request_id
    });
  }

  // Handle multer file upload errors
  if (err.name === 'MulterError') {
    logger.error(ACTION_TYPES.FILE_PROCESSING_FAILED, {
      request_id,
      user_id,
      endpoint,
      latency_ms,
      error_code: 'FILE_UPLOAD_ERROR',
      metadata: { multer_code: err.code }
    });

    return res.status(400).json({
      error: 'File upload failed',
      error_code: 'FILE_UPLOAD_ERROR',
      request_id
    });
  }

  // Handle unexpected errors
  logger.error(ACTION_TYPES.DATABASE_ERROR, {
    request_id,
    user_id,
    endpoint,
    latency_ms,
    error_code: 'INTERNAL_SERVER_ERROR',
    metadata: {
      message: err.message,
      stack: err.stack
    }
  });

  res.status(500).json({
    error: 'Internal server error',
    error_code: 'INTERNAL_SERVER_ERROR',
    request_id
  });
}

module.exports = errorHandler;
