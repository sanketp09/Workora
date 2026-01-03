-- ================================================
-- Workora Employee Authentication Database Schema
-- PostgreSQL with pgcrypto
-- ================================================

-- Connect to your database first
-- \c employee_auth_db

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ================================================
-- EMPLOYEES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    login_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    year_of_joining INTEGER NOT NULL,
    serial_number INTEGER NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'employee')),
    must_change_password BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_login_id ON employees(login_id);
CREATE INDEX IF NOT EXISTS idx_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_year_serial ON employees(year_of_joining, serial_number);
CREATE INDEX IF NOT EXISTS idx_role ON employees(role);

-- ================================================
-- FUNCTION: Get next serial number for a year
-- ================================================
CREATE OR REPLACE FUNCTION get_next_serial_number(p_year INTEGER)
RETURNS INTEGER AS $$
DECLARE
    next_serial INTEGER;
BEGIN
    SELECT COALESCE(MAX(serial_number), 0) + 1 
    INTO next_serial
    FROM employees 
    WHERE year_of_joining = p_year;
    
    RETURN next_serial;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- FUNCTION: Generate login ID
-- Format: OI + [First 2 chars] + [Last 2 chars] + [Year] + [4-digit Serial]
-- Example: OIJODO20220001
-- ================================================
CREATE OR REPLACE FUNCTION generate_login_id(
    p_first_name TEXT,
    p_last_name TEXT,
    p_year INTEGER
)
RETURNS TEXT AS $$
DECLARE
    first_two TEXT;
    last_two TEXT;
    serial_num INTEGER;
    login_id TEXT;
BEGIN
    -- Get first two letters (uppercase)
    first_two := UPPER(SUBSTRING(p_first_name FROM 1 FOR 2));
    last_two := UPPER(SUBSTRING(p_last_name FROM 1 FOR 2));
    
    -- Get next serial number
    serial_num := get_next_serial_number(p_year);
    
    -- Format: OI + first_two + last_two + year + serial (4 digits)
    login_id := 'OI' || first_two || last_two || p_year::TEXT || LPAD(serial_num::TEXT, 4, '0');
    
    RETURN login_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- FUNCTION: Verify password using pgcrypto
-- Returns employee data if password matches
-- ================================================
CREATE OR REPLACE FUNCTION verify_password(
    p_login_id TEXT,
    p_password TEXT
)
RETURNS TABLE(
    employee_id INTEGER,
    login_id VARCHAR,
    email VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    role VARCHAR,
    must_change_password BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.login_id,
        e.email,
        e.first_name,
        e.last_name,
        e.role,
        e.must_change_password
    FROM employees e
    WHERE e.login_id = UPPER(p_login_id)
    AND e.password_hash = crypt(p_password, e.password_hash);
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- FUNCTION: Update timestamp on row update
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- INSERT DEFAULT ADMIN USER
-- ================================================
INSERT INTO employees (
    login_id,
    email,
    password_hash,
    first_name,
    last_name,
    year_of_joining,
    serial_number,
    role,
    must_change_password
) VALUES (
    'OIADMI20220001',
    'admin@workora.com',
    crypt('Admin@123', gen_salt('bf')),
    'Admin',
    'User',
    2022,
    1,
    'admin',
    FALSE
) ON CONFLICT (login_id) DO NOTHING;

-- Insert a test HR user
INSERT INTO employees (
    login_id,
    email,
    password_hash,
    first_name,
    last_name,
    year_of_joining,
    serial_number,
    role,
    must_change_password
) VALUES (
    'OISAJO20220002',
    'sarah@workora.com',
    crypt('HR@12345', gen_salt('bf')),
    'Sarah',
    'Johnson',
    2022,
    2,
    'hr',
    FALSE
) ON CONFLICT (login_id) DO NOTHING;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check if everything is set up correctly
SELECT 'Setup Complete!' as status;

-- Show all employees
SELECT id, login_id, email, first_name, last_name, role, created_at 
FROM employees 
ORDER BY id;

-- Test login ID generation
SELECT generate_login_id('John', 'Doe', 2024) as test_login_id;

-- Test password verification (should return 1 row if correct)
SELECT * FROM verify_password('OIADMI20220001', 'Admin@123');
