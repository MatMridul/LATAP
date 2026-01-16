// AWS-Optimized Database Connection Pool
// Singleton pattern with connection management for RDS

const { Pool } = require('pg');

let pool = null;

const createPool = () => {
  if (pool) return pool;

  const config = {
    connectionString: process.env.DATABASE_URL,
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '5000'),
    
    // AWS RDS optimizations
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000'),
    query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
    
    // SSL for RDS
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: true,
      ca: process.env.RDS_CA_CERT
    } : false
  };

  pool = new Pool(config);

  // Connection error handling
  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    // Don't exit - let health checks handle it
  });

  pool.on('connect', () => {
    console.log('✅ Database connection established');
  });

  pool.on('remove', () => {
    console.log('⚠️  Database connection removed from pool');
  });

  return pool;
};

const getPool = () => {
  if (!pool) {
    return createPool();
  }
  return pool;
};

const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Database pool closed');
  }
};

// Health check query
const healthCheck = async () => {
  try {
    const client = await getPool().connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

module.exports = {
  getPool,
  closePool,
  healthCheck
};
