// Graceful Shutdown Handler
// Ensures clean shutdown for ECS task termination

const { closePool } = require('../config/database');
const { closeRedis } = require('../config/redis');
const { logger } = require('../config/logger');

let isShuttingDown = false;
let server = null;

function setServer(serverInstance) {
  server = serverInstance;
}

async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress');
    return;
  }

  isShuttingDown = true;
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  // Set timeout for forceful shutdown
  const forceShutdownTimeout = setTimeout(() => {
    logger.error('Forceful shutdown after timeout');
    process.exit(1);
  }, 30000); // 30 seconds

  try {
    // Close database connections
    await closePool();
    
    // Close Redis connections
    await closeRedis();
    
    logger.info('Graceful shutdown completed');
    clearTimeout(forceShutdownTimeout);
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    clearTimeout(forceShutdownTimeout);
    process.exit(1);
  }
}

function setupGracefulShutdown() {
  // Handle termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    gracefulShutdown('uncaughtException');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', { reason, promise });
    gracefulShutdown('unhandledRejection');
  });
}

module.exports = {
  setupGracefulShutdown,
  setServer
};
