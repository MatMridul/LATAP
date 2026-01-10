# LATAP Authentication Setup Guide

This guide will help you set up the complete authentication system for LATAP.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- AWS SES account configured
- Git repository cloned

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

Create a PostgreSQL database and run the migrations:

```sql
-- Connect to your PostgreSQL instance and create database
CREATE DATABASE alumni_connect;

-- Run the schema
\i database/schema.sql

-- Run the authentication migration
\i database/auth-migration.sql
```

### 3. Environment Variables

Update `backend/.env` with your actual values:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alumni_connect
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# JWT Configuration (CHANGE THIS IN PRODUCTION)
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random-at-least-32-characters

# AWS SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
FROM_EMAIL=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 4. Start Backend Server

```bash
# Use the new authentication server
node auth-server.js

# Or for development with auto-reload
npm run dev
```

## Frontend Setup

### 1. Install Dependencies

```bash
# From project root
npm install
```

### 2. Environment Variables

Create `.env.local` in the project root:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

### 3. Start Frontend

```bash
npm run dev
```

## AWS SES Setup

### 1. Create AWS Account and SES Service

1. Go to AWS Console → SES
2. Verify your sender email address
3. Create IAM user with SES permissions
4. Get Access Key ID and Secret Access Key

### 2. SES Permissions

Your IAM user needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}
```

### 3. Domain Verification (Production)

For production, verify your domain in SES to avoid sandbox limitations.

## Testing the Authentication Flow

### 1. User Registration

1. Go to `http://localhost:3000/signup`
2. Fill in the form with valid details
3. Check your email for verification link
4. Click the verification link

### 2. User Login

1. Go to `http://localhost:3000/login`
2. Enter your verified credentials
3. You should be redirected to the dashboard

### 3. Protected Routes

- Try accessing `/dashboard` without logging in → should redirect to login
- Try accessing `/verification` without logging in → should redirect to login
- After login, these routes should be accessible

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify-email?token=...` - Email verification
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Protected Endpoints

- `POST /api/verification/upload` - Upload documents (requires auth)
- `POST /api/verification/submit` - Submit verification (requires auth)

## Security Features

✅ **Password Hashing**: bcrypt with 12 salt rounds
✅ **JWT Authentication**: Secure token-based auth
✅ **Email Verification**: Required before login
✅ **Protected Routes**: Frontend and backend protection
✅ **Environment Variables**: No hardcoded secrets
✅ **CORS Configuration**: Proper cross-origin setup

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check AWS SES configuration
   - Verify sender email in SES console
   - Check AWS credentials

2. **Database connection failed**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure database exists

3. **JWT token invalid**
   - Check JWT_SECRET is set
   - Verify token hasn't expired
   - Clear localStorage and login again

4. **CORS errors**
   - Verify frontend URL in CORS config
   - Check API URL in frontend env

### Development Tips

- Use different JWT secrets for dev/prod
- Monitor backend logs for errors
- Use browser dev tools to check network requests
- Test email verification in different email clients

## Production Deployment

### Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS for both frontend and backend
- [ ] Verify domain in AWS SES
- [ ] Set up proper CORS origins
- [ ] Use secure database credentials
- [ ] Enable database SSL connections
- [ ] Set up proper logging and monitoring

### Environment Variables for Production

```env
# Use strong, random values
JWT_SECRET=your-production-jwt-secret-at-least-32-characters-long

# Production database
DB_HOST=your-production-db-host
DB_PASSWORD=your-secure-db-password

# Production AWS credentials
AWS_ACCESS_KEY_ID=your-production-aws-key
AWS_SECRET_ACCESS_KEY=your-production-aws-secret

# Production URLs
FRONTEND_URL=https://yourdomain.com
FROM_EMAIL=noreply@yourdomain.com
```

## Success Criteria

After setup, you should be able to:

✅ Register a new user account
✅ Receive verification email via AWS SES
✅ Verify email and activate account
✅ Login with verified credentials
✅ Access protected dashboard
✅ Access verification flow (authenticated only)
✅ Anonymous users cannot upload documents
✅ User data persists across server restarts

## Support

If you encounter issues:

1. Check the console logs (both frontend and backend)
2. Verify all environment variables are set correctly
3. Test database connectivity
4. Verify AWS SES configuration
5. Check network requests in browser dev tools

The authentication system is now production-ready and follows security best practices!
