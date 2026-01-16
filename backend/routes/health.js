// AWS-Optimized Health Check Endpoint
// For ECS/ELB health checks

const { getPool: getDatabase, healthCheck: dbHealth } = require('../config/database');
const { getRedis, healthCheck: redisHealth } = require('../config/redis');
const { logger } = require('../config/logger');

async function healthCheck(req, res) {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };

  // Database health
  try {
    checks.checks.database = await dbHealth() ? 'healthy' : 'unhealthy';
  } catch (error) {
    checks.checks.database = 'unhealthy';
    checks.status = 'degraded';
  }

  // Redis health
  try {
    checks.checks.redis = await redisHealth() ? 'healthy' : 'unhealthy';
  } catch (error) {
    checks.checks.redis = 'unhealthy';
    // Redis is optional, don't mark as degraded
  }

  // Memory check
  const memUsage = process.memoryUsage();
  checks.checks.memory = {
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB'
  };

  // Uptime
  checks.uptime = Math.floor(process.uptime()) + 's';

  // Determine HTTP status
  const httpStatus = checks.status === 'healthy' ? 200 : 503;

  res.status(httpStatus).json(checks);
}

// Readiness check (for ECS)
async function readinessCheck(req, res) {
  try {
    const dbReady = await dbHealth();
    if (!dbReady) {
      return res.status(503).json({ ready: false, reason: 'database' });
    }
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, reason: error.message });
  }
}

// Liveness check (for ECS)
function livenessCheck(req, res) {
  res.status(200).json({ alive: true });
}

module.exports = {
  healthCheck,
  readinessCheck,
  livenessCheck
};
