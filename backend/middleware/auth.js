import jwt from 'jsonwebtoken';
import db from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Validate UUID format
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Hardened JWT authentication middleware
 * Enforces immutable user identity via user_id only
 */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Validate JWT payload structure - STRICT enforcement
    if (!decoded.sub || !decoded.role) {
      return res.status(403).json({ error: 'Invalid token structure' });
    }

    // Validate user_id format
    if (!isValidUUID(decoded.sub)) {
      return res.status(403).json({ error: 'Invalid user identifier' });
    }

    // Get user from database using ONLY user_id
    const result = await db.query(
      'SELECT id, role, is_email_verified FROM users WHERE id = $1',
      [decoded.sub]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    
    // Enforce email verification
    if (!user.is_email_verified) {
      return res.status(401).json({ error: 'Email not verified' });
    }

    // Verify role matches token
    if (user.role !== decoded.role) {
      return res.status(403).json({ error: 'Role mismatch' });
    }

    // Set req.user with ONLY essential identity data
    req.user = {
      id: user.id,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Authentication failed' });
  }
};

/**
 * Generate hardened JWT token
 * Contains ONLY user_id (sub), role, and timestamps
 */
export const generateToken = (userId, role = 'user') => {
  // Validate inputs
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user_id format for token generation');
  }
  
  if (!['user', 'admin'].includes(role)) {
    throw new Error('Invalid role for token generation');
  }

  const payload = {
    sub: userId,  // Standard JWT subject claim
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };

  return jwt.sign(payload, JWT_SECRET);
};

/**
 * Admin-only middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};
