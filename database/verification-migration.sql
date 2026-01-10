-- Verification System Migration
-- Run this to add verification tables to existing database

-- Verification system tables
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    institution_id VARCHAR(100) NOT NULL,
    claimed_name VARCHAR(255) NOT NULL,
    claimed_institution VARCHAR(255) NOT NULL,
    claimed_program VARCHAR(255) NOT NULL,
    claimed_start_year INTEGER NOT NULL,
    claimed_end_year INTEGER NOT NULL,
    document_path VARCHAR(500) NOT NULL,
    document_hash VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_request_id UUID REFERENCES verification_requests(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    decision VARCHAR(20),
    failure_reason TEXT,
    ocr_text TEXT,
    extracted_data JSONB,
    matching_results JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Indexes for verification system
CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_requests_hash ON verification_requests(document_hash);
CREATE INDEX IF NOT EXISTS idx_verification_attempts_request ON verification_attempts(verification_request_id);

-- Add verification status columns to users table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verification_status') THEN
        ALTER TABLE users ADD COLUMN verification_status VARCHAR(20) DEFAULT 'unverified';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'credibility_score') THEN
        ALTER TABLE users ADD COLUMN credibility_score INTEGER DEFAULT 30;
    END IF;
END $$;
