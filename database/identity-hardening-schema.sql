-- LATAP Identity Hardening Schema
-- Immutable user_id foundation with audit logging

-- Core users table (hardened)
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_pkey CASCADE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE,
ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Ensure email uniqueness
ALTER TABLE users 
ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Audit logs (immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Institution mapping (many-to-many with history)
CREATE TABLE IF NOT EXISTS user_institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    source VARCHAR(20) NOT NULL CHECK (source IN ('OCR', 'DigiLocker', 'Manual', 'Admin')),
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_institutions_user_id ON user_institutions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_institutions_active ON user_institutions(is_active) WHERE is_active = TRUE;

-- Update verification_requests to use user_id
ALTER TABLE verification_requests 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Ensure foreign key constraints
ALTER TABLE verification_requests 
DROP CONSTRAINT IF EXISTS verification_requests_user_id_fkey,
ADD CONSTRAINT verification_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Remove old institution_id column from users if exists
-- ALTER TABLE users DROP COLUMN IF EXISTS institution_id;
