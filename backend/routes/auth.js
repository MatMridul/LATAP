const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { Pool } = require('pg');
const { generateToken, authenticateToken, logAudit } = require('../middleware/identityAuth');
const { sendVerificationEmail } = require('../services/emailService');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const router = express.Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Password validation rules
    const passwordErrors = [];
    if (password.length < 8) {
      passwordErrors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push('one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push('one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      passwordErrors.push('one special character');
    }

    if (passwordErrors.length > 0) {
      return res.status(400).json({ 
        error: `Password must contain ${passwordErrors.join(', ')}`
      });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with immutable UUID
    const userId = uuidv4();
    await pool.query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, is_email_verified) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, email, passwordHash, firstName, lastName, false]
    );

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );

    // Send verification email
    // await sendVerificationEmail(email, token);

    // Audit log signup
    await logAudit({
      user_id: userId,
      action: 'USER_SIGNUP',
      entity_type: 'user',
      entity_id: userId,
      metadata: { email, firstName, lastName },
      req
    });

    res.status(201).json({
      message: 'Account created successfully. Please check your email to verify your account.',
      userId
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email verification endpoint
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find and validate token
    const tokenResult = await pool.query(
      `SELECT user_id, expires_at, used FROM email_verification_tokens 
       WHERE token = $1`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    const tokenData = tokenResult.rows[0];

    if (tokenData.used) {
      return res.status(400).json({ error: 'Verification token has already been used' });
    }

    if (new Date() > tokenData.expires_at) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Mark user as verified and token as used
    await pool.query('BEGIN');
    
    await pool.query(
      'UPDATE users SET is_email_verified = TRUE WHERE id = $1',
      [tokenData.user_id]
    );

    await pool.query(
      'UPDATE email_verification_tokens SET used = TRUE WHERE token = $1',
      [token]
    );

    await pool.query('COMMIT');

    // Audit log email verification
    await logAudit({
      user_id: tokenData.user_id,
      action: 'EMAIL_VERIFIED',
      entity_type: 'user',
      entity_id: tokenData.user_id,
      metadata: { token_used: true },
      req
    });

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const userResult = await pool.query(
      'SELECT id, email, password_hash, is_email_verified, first_name, last_name FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.is_email_verified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }

    // Generate JWT token with user_id ONLY
    const token = generateToken(user.id);

    // Audit log login
    await logAudit({
      user_id: user.id,
      action: 'USER_LOGIN',
      entity_type: 'user',
      entity_id: user.id,
      metadata: { email },
      req
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user endpoint - uses ONLY req.user.id
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Fetch user data using authenticated user_id
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, is_email_verified FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isEmailVerified: user.is_email_verified
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
