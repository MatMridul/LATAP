// Job Scheduler
// Cron-style scheduling for background jobs

const cron = require('node-cron');
const { runSafetyJobs } = require('./safetyJobs');
const { logger } = require('../utils/structuredLogger');

function startScheduler() {
  // Run safety jobs every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('SCHEDULER_TRIGGERED', {
      metadata: { job_type: 'safety_jobs' }
    });
    
    try {
      await runSafetyJobs();
    } catch (error) {
      logger.error('SCHEDULER_ERROR', {
        error_code: 'SCHEDULER_FAILED',
        metadata: {
          error: error.message,
          stack: error.stack
        }
      });
    }
  });

  logger.info('SCHEDULER_STARTED', {
    metadata: { 
      jobs: ['safety_jobs'],
      schedule: 'hourly'
    }
  });
}

module.exports = { startScheduler };
