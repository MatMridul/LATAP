// AWS-Optimized Redis Connection
// Singleton with ElastiCache support

const Redis = require('ioredis');

let redis = null;
const isProduction = process.env.NODE_ENV === 'production';

const createRedisClient = () => {
  if (redis) return redis;

  const config = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    
    // AWS ElastiCache optimizations
    retryStrategy: (times) => {
      if (times > 10) return null;
      return Math.min(times * 100, 3000);
    },
    
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false,
    connectTimeout: 10000,
    lazyConnect: false,
    
    // Cluster mode for ElastiCache
    ...(process.env.REDIS_CLUSTER === 'true' && {
      clusterRetryStrategy: (times) => Math.min(100 * times, 2000)
    })
  };

  redis = new Redis(config);

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redis.on('error', (err) => {
    if (isProduction) {
      console.error('❌ Redis error in production:', err.message);
    } else {
      console.warn('⚠️  Redis error in development:', err.message);
    }
  });

  redis.on('close', () => {
    console.log('⚠️  Redis connection closed');
  });

  redis.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
  });

  return redis;
};

const getRedis = () => {
  if (!redis) {
    return createRedisClient();
  }
  return redis;
};

const closeRedis = async () => {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('✅ Redis connection closed');
  }
};

const healthCheck = async () => {
  try {
    const client = getRedis();
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
};

module.exports = {
  getRedis,
  closeRedis,
  healthCheck
};
