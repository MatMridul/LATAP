-- Demo data for Alumni Connect Platform

-- Insert demo institution
INSERT INTO institutions (id, name, domain, logo_url, primary_color, subscription_tier, max_alumni) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Stanford University',
    'demo',
    'https://example.com/stanford-logo.png',
    '#8C1515',
    'professional',
    5000
);

-- Insert demo users (password is 'password' for all)
INSERT INTO users (id, institution_id, email, password_hash, first_name, last_name, graduation_year, degree, department, current_company, current_position, location, bio, is_admin) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@stanford.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', 'Sarah', 'Johnson', 2010, 'MBA', 'Business', 'Stanford Alumni Association', 'Director', 'Palo Alto, CA', 'Managing alumni relations and engagement programs.', true),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'john.doe@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', 'John', 'Doe', 2015, 'BS Computer Science', 'Engineering', 'Google', 'Senior Software Engineer', 'Mountain View, CA', 'Passionate about AI and machine learning. Always happy to mentor fellow alumni.', false),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'jane.smith@startup.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', 'Jane', 'Smith', 2018, 'MS Computer Science', 'Engineering', 'TechStartup Inc', 'CTO', 'San Francisco, CA', 'Building the next generation of fintech solutions.', false),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'mike.wilson@consulting.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.', 'Mike', 'Wilson', 2012, 'MBA', 'Business', 'McKinsey & Company', 'Principal', 'New York, NY', 'Strategy consultant with focus on technology and healthcare.', false);

-- Insert demo events
INSERT INTO events (id, institution_id, created_by, title, description, event_date, location, is_virtual, max_attendees, registration_required) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Annual Alumni Reunion', 'Join us for our annual reunion with networking, dinner, and campus tours.', '2024-12-15 18:00:00', 'Stanford Campus, Palo Alto', false, 500, true),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Tech Career Panel', 'Panel discussion on careers in technology with successful alumni.', '2024-12-20 19:00:00', 'Virtual Event', true, 200, true),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Entrepreneurship Workshop', 'Learn about starting your own company from successful alumni entrepreneurs.', '2025-01-10 14:00:00', 'Stanford Graduate School of Business', false, 100, true);

-- Insert demo jobs
INSERT INTO jobs (id, institution_id, posted_by, title, company, location, job_type, description, requirements, salary_range, application_url, expires_at) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Senior Software Engineer', 'Google', 'Mountain View, CA', 'Full-time', 'Join our team building next-generation AI products. Work on cutting-edge technology with world-class engineers.', 'BS/MS in Computer Science, 5+ years experience, Python/Java expertise', '$180,000 - $250,000', 'https://careers.google.com/jobs/123', '2025-02-15 23:59:59'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Full Stack Developer', 'TechStartup Inc', 'San Francisco, CA', 'Full-time', 'Early-stage fintech startup looking for versatile developers to build our core platform.', 'Experience with React, Node.js, PostgreSQL. Startup experience preferred.', '$120,000 - $160,000 + equity', 'https://techstartup.com/careers', '2025-01-30 23:59:59'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Strategy Consultant', 'McKinsey & Company', 'Multiple Locations', 'Full-time', 'Join our technology practice to help Fortune 500 companies with digital transformation.', 'MBA from top-tier school, 2+ years consulting experience', '$150,000 - $200,000', 'https://mckinsey.com/careers', '2025-03-01 23:59:59');
