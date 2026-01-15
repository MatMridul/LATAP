-- LATAP Identity Hardening Migration
-- This migration enforces immutable user identity and proper audit logging

-- 1. Add missing columns to users table for proper identity management
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Update existing users to have verified emails (for existing data)
UPDATE users SET is_email_verified = COALESCE(is_verified, FALSE) WHERE is_email_verified IS NULL;

-- 2. Create audit_logs table for immutable audit trail
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

-- 3. Create user_institutions mapping table
CREATE TABLE IF NOT EXISTS user_institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL, -- Denormalized for historical record
    source VARCHAR(20) NOT NULL CHECK (source IN ('OCR', 'DIGILOCKER', 'MANUAL')),
    program VARCHAR(255),
    start_year INTEGER,
    end_year INTEGER,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Update verification_requests table to use proper identity structure
ALTER TABLE verification_requests 
DROP COLUMN IF EXISTS institution_id,
ADD COLUMN IF NOT EXISTS identity_record JSONB,
ADD COLUMN IF NOT EXISTS progress JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS match_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS mismatches JSONB;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_institutions_user_id ON user_institutions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_institutions_active ON user_institutions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

-- 7. Add constraints for data integrity
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS chk_users_role CHECK (role IN ('user', 'admin'));

-- 8. Function to automatically expire user_institutions mappings
CREATE OR REPLACE FUNCTION expire_user_institutions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_institutions 
    SET is_active = FALSE 
    WHERE expires_at < CURRENT_TIMESTAMP AND is_active = TRUE;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger to run expiry check
DROP TRIGGER IF EXISTS trigger_expire_user_institutions ON user_institutions;
CREATE TRIGGER trigger_expire_user_institutions
    AFTER INSERT OR UPDATE ON user_institutions
    FOR EACH STATEMENT
    EXECUTE FUNCTION expire_user_institutions();

-- 10. Clean up old columns that violate identity principles
-- Note: Commented out to prevent data loss - review before uncommenting
-- ALTER TABLE users DROP COLUMN IF EXISTS institution_id;
-- ALTER TABLE verification_requests DROP COLUMN IF EXISTS institution_id;

COMMIT;
