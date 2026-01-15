#!/bin/bash

# LATAP Identity Hardening Migration Script
# Applies immutable user_id foundation and audit logging

set -e

echo "🔒 Starting LATAP Identity Hardening Migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable not set"
    exit 1
fi

# Apply identity hardening schema
echo "📊 Applying identity hardening schema..."
psql "$DATABASE_URL" -f database/identity-hardening-schema.sql

# Apply email verification schema
echo "📧 Applying email verification schema..."
psql "$DATABASE_URL" -f database/email-verification-schema.sql

# Verify critical tables exist
echo "✅ Verifying schema integrity..."
psql "$DATABASE_URL" -c "
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
         THEN '✓ users table exists' 
         ELSE '❌ users table missing' END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') 
         THEN '✓ audit_logs table exists' 
         ELSE '❌ audit_logs table missing' END,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_institutions') 
         THEN '✓ user_institutions table exists' 
         ELSE '❌ user_institutions table missing' END;
"

# Verify user_id column exists and is UUID
echo "🔍 Verifying user_id integrity..."
psql "$DATABASE_URL" -c "
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';
"

echo "🎯 Identity hardening migration completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update server.js to use hardened middleware"
echo "2. Replace old auth routes with hardened versions"
echo "3. Test authentication flow"
echo "4. Verify audit logging is working"
