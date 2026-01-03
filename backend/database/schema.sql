-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create employee_profiles table
CREATE TABLE IF NOT EXISTS employee_profiles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  login_id VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  company VARCHAR(255),
  department VARCHAR(100),
  manager VARCHAR(255),
  location VARCHAR(255),
  about TEXT,
  job_description TEXT,
  interests TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create employee_salary table
CREATE TABLE IF NOT EXISTS employee_salary (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  wage_type VARCHAR(20) DEFAULT 'monthly',
  monthly_wage DECIMAL(12, 2) NOT NULL,
  yearly_wage DECIMAL(12, 2) NOT NULL,
  working_days INTEGER DEFAULT 5,
  break_time INTEGER DEFAULT 60,
  salary_components JSONB DEFAULT '[]'::jsonb,
  pf_employee DECIMAL(12, 2) DEFAULT 0,
  pf_employer DECIMAL(12, 2) DEFAULT 0,
  pf_rate DECIMAL(5, 2) DEFAULT 12.00,
  professional_tax DECIMAL(10, 2) DEFAULT 200.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employee_profiles_login_id ON employee_profiles(login_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_email ON employee_profiles(email);
CREATE INDEX IF NOT EXISTS idx_employee_salary_employee_id ON employee_salary(employee_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_employee_profiles_updated_at 
  BEFORE UPDATE ON employee_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_salary_updated_at 
  BEFORE UPDATE ON employee_salary
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO employee_profiles (id, name, login_id, email, mobile, company, department, manager, location, about, job_description, interests, skills, certifications)
VALUES 
  ('EMP001', 'John Doe', 'OIJD2024001', 'john.doe@workora.com', '+1234567890', 'Workora Inc.', 'Engineering', 'Jane Smith', 'New York', 
   'Experienced software engineer with 5+ years in full-stack development.', 
   'I love solving complex problems and building scalable applications.', 
   'Reading tech blogs, playing chess, hiking',
   '["JavaScript", "React", "Node.js", "PostgreSQL", "AWS"]'::jsonb,
   '["AWS Certified Solutions Architect", "Google Cloud Professional"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employee_salary (employee_id, wage_type, monthly_wage, yearly_wage, working_days, break_time, pf_rate, professional_tax, salary_components)
VALUES 
  ('EMP001', 'monthly', 50000.00, 600000.00, 5, 60, 12.00, 200.00,
   '[
     {"id": 1, "name": "Basic Salary", "computationType": "percentage", "value": 50, "baseOn": "wage", "amount": 25000},
     {"id": 2, "name": "House Rent Allowance", "computationType": "percentage", "value": 50, "baseOn": "basic", "amount": 12500},
     {"id": 3, "name": "Standard Allowance", "computationType": "fixed", "value": 4167, "baseOn": "none", "amount": 4167},
     {"id": 4, "name": "Performance Bonus", "computationType": "percentage", "value": 8.33, "baseOn": "basic", "amount": 2082.5},
     {"id": 5, "name": "Leave Travel Allowance", "computationType": "percentage", "value": 8.33, "baseOn": "basic", "amount": 2082.5},
     {"id": 6, "name": "Fixed Allowance", "computationType": "auto", "value": 0, "baseOn": "remaining", "amount": 4168}
   ]'::jsonb)
ON CONFLICT (employee_id) DO NOTHING;

-- Query to verify the data
-- SELECT * FROM employee_profiles;
-- SELECT * FROM employee_salary;

-- Query to get complete employee profile with salary
-- SELECT 
--   ep.*,
--   es.monthly_wage,
--   es.salary_components
-- FROM employee_profiles ep
-- LEFT JOIN employee_salary es ON ep.id = es.employee_id
-- WHERE ep.login_id = 'OIJD2024001';
