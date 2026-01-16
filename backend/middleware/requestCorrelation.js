// Request Correlation Middleware
// Generates and propagates request_id across all operations

const { v4: uuidv4 } = require('uuid');

function requestCorrelation(req, res, next) {
  // Generate or extract request_id
  const request_id = req.headers['x-request-id'] || uuidv4();
  
  // Attach to request context
  req.context = {
    request_id,
    start_time: Date.now()
  };
  
  // Add to response headers
  res.setHeader('X-Request-ID', request_id);
  
  next();
}

module.exports = requestCorrelation;
