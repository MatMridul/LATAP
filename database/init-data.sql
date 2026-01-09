-- Insert demo institutions
INSERT INTO institutions (name, domain) VALUES 
('Indian Institute of Technology Delhi', 'iitd'),
('Indian Institute of Technology Bombay', 'iitb'),
('Delhi University', 'du'),
('Manipal Academy of Higher Education', 'manipal')
ON CONFLICT (domain) DO NOTHING;

-- Insert demo users (password is 'password123' for all)
INSERT INTO users (
  institution_id, 
  email, 
  password_hash, 
  first_name, 
  last_name, 
  graduation_year, 
  degree, 
  department,
  current_company,
  current_position,
  location,
  is_verified
) VALUES 
(
  (SELECT id FROM institutions WHERE domain = 'iitd'),
  'demo@example.com',
  '$2b$10$rOvHPxfzMX.LfJIeYqNzUeQs8QJ5pJ5pJ5pJ5pJ5pJ5pJ5pJ5pJ5p',
  'Demo',
  'User',
  2020,
  'B.Tech Computer Science',
  'Computer Science',
  'Tech Corp',
  'Software Engineer',
  'Delhi, India',
  true
)
ON CONFLICT (email) DO NOTHING;
