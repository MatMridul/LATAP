-- LATAP Core Product Database Schema
-- Opportunities, Applications, Talent Profiles, Subscriptions

-- Talent Profiles (Extended user data for matching)
CREATE TABLE talent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Info
    headline VARCHAR(200),
    bio TEXT,
    location VARCHAR(200),
    
    -- Skills & Experience
    skills TEXT[], -- Array of skills
    years_of_experience INTEGER,
    current_role VARCHAR(200),
    current_company VARCHAR(200),
    
    -- Education (from verification)
    highest_degree VARCHAR(100),
    field_of_study VARCHAR(200),
    
    -- Preferences
    job_types VARCHAR(50)[], -- ['full-time', 'part-time', 'contract', 'internship']
    preferred_locations VARCHAR(200)[],
    remote_preference VARCHAR(20) CHECK (remote_preference IN ('remote', 'hybrid', 'onsite', 'flexible')),
    expected_salary_min INTEGER,
    expected_salary_max INTEGER,
    
    -- Privacy
    is_searchable BOOLEAN DEFAULT TRUE,
    is_open_to_opportunities BOOLEAN DEFAULT TRUE,
    
    -- Resume
    resume_s3_key VARCHAR(500),
    resume_text TEXT, -- OCR extracted text
    resume_uploaded_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Opportunities (Jobs, Internships, Projects)
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Ownership
    posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    
    -- Basic Info
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    opportunity_type VARCHAR(20) NOT NULL CHECK (opportunity_type IN ('job', 'internship', 'project', 'volunteer')),
    
    -- Details
    company_name VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    is_remote BOOLEAN DEFAULT FALSE,
    job_type VARCHAR(20) CHECK (job_type IN ('full-time', 'part-time', 'contract', 'temporary')),
    
    -- Requirements
    required_skills TEXT[],
    min_experience INTEGER,
    max_experience INTEGER,
    required_degree VARCHAR(100),
    
    -- Compensation
    salary_min INTEGER,
    salary_max INTEGER,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Visibility
    visibility VARCHAR(20) NOT NULL DEFAULT 'institution' CHECK (visibility IN ('institution', 'verified', 'public')),
    -- institution: Only verified users from same institution
    -- verified: All verified users across institutions
    -- public: Everyone (including unverified)
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'filled')),
    expires_at TIMESTAMP,
    
    -- Metadata
    application_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max),
    CHECK (min_experience IS NULL OR max_experience IS NULL OR min_experience <= max_experience)
);

-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Application Data
    cover_letter TEXT,
    resume_s3_key VARCHAR(500),
    resume_text TEXT, -- OCR extracted at application time
    
    -- Status Tracking
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'shortlisted', 'rejected', 'accepted', 'withdrawn')),
    
    -- Matching Score (deterministic)
    match_score INTEGER, -- 0-100
    match_breakdown JSONB, -- Detailed scoring breakdown
    
    -- Timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicates
    UNIQUE(opportunity_id, applicant_id)
);

-- Subscriptions (Premium Access)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Plan
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('free', 'basic', 'premium', 'enterprise')),
    
    -- Limits (NULL = unlimited)
    max_opportunities_per_month INTEGER,
    max_applications_per_month INTEGER,
    can_see_verified_feed BOOLEAN DEFAULT FALSE,
    can_see_public_feed BOOLEAN DEFAULT FALSE,
    can_post_opportunities BOOLEAN DEFAULT FALSE,
    can_access_matching BOOLEAN DEFAULT FALSE,
    
    -- Billing
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Usage Tracking
    opportunities_posted_this_month INTEGER DEFAULT 0,
    applications_submitted_this_month INTEGER DEFAULT 0,
    last_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application Status History (Audit Trail)
CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_talent_profiles_user_id ON talent_profiles(user_id);
CREATE INDEX idx_talent_profiles_searchable ON talent_profiles(is_searchable) WHERE is_searchable = TRUE;
CREATE INDEX idx_talent_profiles_open_to_opportunities ON talent_profiles(is_open_to_opportunities) WHERE is_open_to_opportunities = TRUE;

CREATE INDEX idx_opportunities_institution ON opportunities(institution_id);
CREATE INDEX idx_opportunities_posted_by ON opportunities(posted_by);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_visibility ON opportunities(visibility);
CREATE INDEX idx_opportunities_expires_at ON opportunities(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);

CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at DESC);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_talent_profiles_updated_at BEFORE UPDATE ON talent_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to reset monthly usage counters
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE subscriptions
    SET opportunities_posted_this_month = 0,
        applications_submitted_this_month = 0,
        last_reset_at = CURRENT_TIMESTAMP
    WHERE last_reset_at < date_trunc('month', CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;
