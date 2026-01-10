const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const Redis = require('ioredis');
const { body, validationResult, param } = require('express-validator');

const app = express();
const port = process.env.PORT || 3001;

// Database connection with connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis connection for caching and sessions
const redis = new Redis(process.env.REDIS_URL, {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
});

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// Middleware to extract tenant from subdomain or header
const extractTenant = async (req, res, next) => {
  try {
    let tenantDomain = null;
    
    // Try to get tenant from subdomain
    const host = req.get('host');
    if (host && host.includes('.')) {
      tenantDomain = host.split('.')[0];
    }
    
    // Fallback to custom header for development
    if (!tenantDomain) {
      tenantDomain = req.get('x-tenant-domain') || 'default';
    }
    
    // Cache tenant info in Redis
    const cacheKey = `tenant:${tenantDomain}`;
    let tenant = await redis.get(cacheKey);
    
    if (!tenant) {
      const result = await pool.query(
        'SELECT * FROM institutions WHERE domain = $1',
        [tenantDomain]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Institution not found' });
      }
      
      tenant = JSON.stringify(result.rows[0]);
      await redis.setex(cacheKey, 300, tenant); // Cache for 5 minutes
    }
    
    req.tenant = JSON.parse(tenant);
    next();
  } catch (error) {
    console.error('Tenant extraction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Enhanced auth middleware with Redis session management
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      // Get user info from cache or database
      const cacheKey = `user:${decoded.userId}`;
      let user = await redis.get(cacheKey);
      
      if (!user) {
        const result = await pool.query(
          'SELECT * FROM users WHERE id = $1 AND institution_id = $2',
          [decoded.userId, decoded.institutionId]
        );
        
        if (result.rows.length === 0) {
          return res.status(401).json({ error: 'User not found' });
        }
        
        user = JSON.stringify(result.rows[0]);
        await redis.setex(cacheKey, 600, user); // Cache for 10 minutes
      }
      
      req.user = JSON.parse(user);
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Input validation middleware
const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];

// Authentication routes
app.post('/api/auth/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    const result = await pool.query(
      `SELECT u.*, i.domain, i.name as institution_name 
       FROM users u 
       JOIN institutions i ON u.institution_id = i.id 
       WHERE u.email = $1`,
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const tokenPayload = {
      userId: user.id,
      institutionId: user.institution_id,
      email: user.email,
      isAdmin: user.is_admin,
    };
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
    
    // Cache user session
    await redis.setex(`session:${user.id}`, 86400, token);
    
    const userResponse = { ...user };
    delete userResponse.password_hash;
    
    res.json({ 
      token, 
      user: userResponse,
      institution: {
        name: user.institution_name,
        domain: user.domain,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    
    // Blacklist the token
    await redis.setex(`blacklist:${token}`, 86400, 'true');
    
    // Remove user session
    await redis.del(`session:${req.user.id}`);
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Alumni directory with advanced search and caching
app.get('/api/alumni', [extractTenant, authenticateToken], async (req, res) => {
  try {
    const { search, graduationYear, department, location, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // Build dynamic query
    let query = `
      SELECT u.id, u.first_name, u.last_name, u.graduation_year, 
             u.degree, u.department, u.current_company, u.current_position, 
             u.location, u.profile_image_url, u.linkedin_url
      FROM users u 
      WHERE u.institution_id = $1 AND u.privacy_level = 'public'
    `;
    
    const params = [req.tenant.id];
    let paramCount = 1;
    
    if (search) {
      paramCount++;
      query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.current_company ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    if (graduationYear) {
      paramCount++;
      query += ` AND u.graduation_year = $${paramCount}`;
      params.push(graduationYear);
    }
    
    if (department) {
      paramCount++;
      query += ` AND u.department ILIKE $${paramCount}`;
      params.push(`%${department}%`);
    }
    
    if (location) {
      paramCount++;
      query += ` AND u.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }
    
    query += ` ORDER BY u.last_name, u.first_name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    // Check cache first
    const cacheKey = `alumni:${req.tenant.id}:${JSON.stringify(req.query)}`;
    let result = await redis.get(cacheKey);
    
    if (!result) {
      const dbResult = await pool.query(query, params);
      result = JSON.stringify(dbResult.rows);
      await redis.setex(cacheKey, 300, result); // Cache for 5 minutes
    }
    
    res.json(JSON.parse(result));
  } catch (error) {
    console.error('Alumni directory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Events with pagination and filtering
app.get('/api/events', [extractTenant, authenticateToken], async (req, res) => {
  try {
    const { upcoming = true, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT e.*, u.first_name, u.last_name,
             COUNT(*) OVER() as total_count
      FROM events e 
      JOIN users u ON e.created_by = u.id
      WHERE e.institution_id = $1
    `;
    
    const params = [req.tenant.id];
    
    if (upcoming === 'true') {
      query += ` AND e.event_date >= NOW()`;
    }
    
    query += ` ORDER BY e.event_date ${upcoming === 'true' ? 'ASC' : 'DESC'} LIMIT $2 OFFSET $3`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      events: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows[0]?.total_count || 0,
      }
    });
  } catch (error) {
    console.error('Events error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User registration endpoint
app.post('/api/auth/register', authLimiter, [
  body('name').isLength({ min: 2 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['student', 'alumni', 'hirer']),
  body('institution').isLength({ min: 2 }).trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, role, institution } = req.body;
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Find or create institution
    let institutionRecord = await pool.query('SELECT id FROM institutions WHERE name = $1', [institution]);
    if (institutionRecord.rows.length === 0) {
      const domain = institution.toLowerCase().replace(/[^a-z0-9]/g, '');
      institutionRecord = await pool.query(
        'INSERT INTO institutions (name, domain) VALUES ($1, $2) RETURNING id',
        [institution, domain]
      );
    }

    // Create user with temporary password (they'll set it during verification)
    const tempPassword = Math.random().toString(36).substring(2, 15);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await pool.query(
      `INSERT INTO users (institution_id, email, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name`,
      [institutionRecord.rows[0].id, email, passwordHash, firstName, lastName]
    );

    const user = result.rows[0];
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role,
        institution,
        verificationStatus: 'unverified',
        credibilityScore: 30
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verification endpoint
app.post('/api/auth/verify', [
  body('userId').isUUID(),
  body('method').isIn(['digilocker', 'documents', 'skip']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, method } = req.body;

    let verificationStatus = 'pending';
    let credibilityScore = 30;

    if (method === 'skip') {
      verificationStatus = 'unverified';
      credibilityScore = 30;
    } else if (method === 'digilocker') {
      // DigiLocker integration not implemented
      return res.status(501).json({ 
        error: 'DIGILOCKER_NOT_IMPLEMENTED',
        message: 'DigiLocker verification service is not yet implemented'
      });
    } else if (method === 'documents') {
      verificationStatus = 'pending';
      credibilityScore = 50;
    }

    await pool.query(
      'UPDATE users SET is_verified = $1 WHERE id = $2',
      [verificationStatus === 'verified', userId]
    );

    res.json({
      verificationStatus,
      credibilityScore,
      verificationMethod: method,
      verificationDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT u.*, i.name as institution_name 
       FROM users u 
       JOIN institutions i ON u.institution_id = i.id 
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    delete user.password_hash;

    res.json({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      institution: user.institution_name,
      verificationStatus: user.is_verified ? 'verified' : 'unverified',
      credibilityScore: user.is_verified ? 70 : 30
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Jobs with advanced filtering
app.get('/api/jobs', [extractTenant, authenticateToken], async (req, res) => {
  try {
    const { jobType, location, company, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT j.*, u.first_name, u.last_name,
             COUNT(*) OVER() as total_count
      FROM jobs j 
      JOIN users u ON j.posted_by = u.id
      WHERE j.institution_id = $1 AND (j.expires_at IS NULL OR j.expires_at >= NOW())
    `;
    
    const params = [req.tenant.id];
    let paramCount = 1;
    
    if (jobType) {
      paramCount++;
      query += ` AND j.job_type = $${paramCount}`;
      params.push(jobType);
    }
    
    if (location) {
      paramCount++;
      query += ` AND j.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }
    
    if (company) {
      paramCount++;
      query += ` AND j.company ILIKE $${paramCount}`;
      params.push(`%${company}%`);
    }
    
    query += ` ORDER BY j.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      jobs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows[0]?.total_count || 0,
      }
    });
  } catch (error) {
    console.error('Jobs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verification routes (isolated module)
try {
  const verificationRoutes = require('./verification/routes/verification.routes.js');
  app.use('/api/verification', verificationRoutes);
  console.log('✅ Verification module loaded');
} catch (error) {
  console.warn('⚠️ Verification module not available:', error.message);
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    requestId: req.id || 'unknown'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  await redis.quit();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`🚀 Alumni Connect API running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
