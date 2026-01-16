// AWS CloudWatch Logger
// Structured logging for production monitoring

const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

const formats = [
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
];

if (!isProduction) {
  formats.push(winston.format.colorize());
  formats.push(winston.format.simple());
}

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(...formats)
  })
];

// Add CloudWatch in production
if (isProduction && process.env.AWS_CLOUDWATCH_GROUP) {
  transports.push(new CloudWatchTransport({
    logGroupName: process.env.AWS_CLOUDWATCH_GROUP,
    logStreamName: `${process.env.AWS_ECS_TASK_ID || 'local'}-${Date.now()}`,
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    messageFormatter: ({ level, message, ...meta }) => {
      return JSON.stringify({ level, message, ...meta });
    }
  }));
}

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(...formats),
  transports,
  exitOnError: false
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id
    });
  });
  
  next();
};

module.exports = {
  logger,
  requestLogger
};
