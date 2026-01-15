-- Production Verification Pipeline Schema Updates

-- Drop existing verification tables
DROP TABLE IF EXISTS verification_attempts CASCADE;
DROP TABLE IF EXISTS verification_requests CASCADE;

-- Updated verification requests table
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- User claims (normalized to IdentityRecord)
    claimed_name VARCHAR(255) NOT NULL,
    claimed_institution VARCHAR(255) NOT NULL,
    claimed_program VARCHAR(255) NOT NULL,
    claimed_start_year INTEGER NOT NULL,
    claimed_end_year INTEGER NOT NULL,
    user_identity_record JSONB NOT NULL, -- IdentityRecord format
    
    -- Document handling
    original_filename VARCHAR(255) NOT NULL,
    document_hash VARCHAR(64) UNIQUE NOT NULL,
    document_deleted_at TIMESTAMP, -- When document was deleted after OCR
    
    -- OCR results
    ocr_completed_at TIMESTAMP,
    ocr_raw_text TEXT,
    ocr_blocks JSONB,
    ocr_identity_record JSONB, -- IdentityRecord format
    ocr_error TEXT,
    
    -- Matching results
    matching_completed_at TIMESTAMP,
    match_score INTEGER, -- 0-100
    field_matches JSONB,
    mismatches JSONB,
    matching_error TEXT,
    
    -- Verification status and lifecycle
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'PROCESSING_OCR', 'OCR_FAILED', 'MATCHING', 
        'APPROVED', 'REJECTED', 'MANUAL_REVIEW', 'EXPIRED'
    )),
    
    -- Verification validity (1 year)
    verified_at TIMESTAMP,
    expires_at TIMESTAMP, -- verified_at + 1 year
    
    -- Audit trail
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure expiry is set when verified
    CONSTRAINT valid_expiry CHECK (
        (verified_at IS NULL AND expires_at IS NULL) OR 
        (verified_at IS NOT NULL AND expires_at IS NOT NULL)
    )
);

-- Document deletion audit log
CREATE TABLE document_deletion_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_request_id UUID REFERENCES verification_requests(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    document_hash VARCHAR(64) NOT NULL,
    deletion_reason VARCHAR(100) NOT NULL, -- 'OCR_COMPLETE', 'CLEANUP', 'ERROR'
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_by VARCHAR(50) DEFAULT 'SYSTEM'
);

-- Verification progress tracking
CREATE TABLE verification_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_request_id UUID REFERENCES verification_requests(id) ON DELETE CASCADE,
    stage VARCHAR(20) NOT NULL CHECK (stage IN (
        'UPLOAD', 'OCR', 'MATCHING', 'COMPLETE'
    )),
    progress_percentage INTEGER NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    message TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_requests_hash ON verification_requests(document_hash);
CREATE INDEX idx_verification_requests_expires ON verification_requests(expires_at);
CREATE INDEX idx_verification_progress_request ON verification_progress(verification_request_id);
CREATE INDEX idx_document_deletion_log_request ON document_deletion_log(verification_request_id);

-- Function to automatically set expires_at when verified_at is set
CREATE OR REPLACE FUNCTION set_verification_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL THEN
        NEW.expires_at = NEW.verified_at + INTERVAL '1 year';
    END IF;
    
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically set expiry
CREATE TRIGGER trigger_set_verification_expiry
    BEFORE UPDATE ON verification_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_verification_expiry();

-- Function to check and mark expired verifications
CREATE OR REPLACE FUNCTION mark_expired_verifications()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE verification_requests 
    SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'APPROVED' 
    AND expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Update users table to include verification status
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'UNVERIFIED' 
    CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'VERIFIED', 'EXPIRED', 'REJECTED'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP;
