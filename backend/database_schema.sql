-- Workora HR Management System Database Schema
-- Run these queries in pgAdmin 4 to create the necessary tables

-- 1. Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'employee')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    salary DECIMAL(12, 2),
    hire_date DATE NOT NULL,
    address TEXT,
    emergency_contact JSONB, -- Store as JSON: {"name": "John Doe", "phone": "+1234567890", "relation": "Spouse"}
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Attendance table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMP,
    clock_out TIMESTAMP,
    break_duration INTEGER DEFAULT 0, -- in minutes
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- 4. Payroll table
CREATE TABLE payroll (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_month INTEGER CHECK (pay_period_month >= 1 AND pay_period_month <= 12),
    pay_period_year INTEGER,
    hours_worked DECIMAL(5, 2) DEFAULT 0,
    overtime_hours DECIMAL(5, 2) DEFAULT 0,
    gross_pay DECIMAL(12, 2) NOT NULL,
    tax_deduction DECIMAL(12, 2) DEFAULT 0,
    insurance_deduction DECIMAL(12, 2) DEFAULT 0,
    other_deductions DECIMAL(12, 2) DEFAULT 0,
    total_deductions DECIMAL(12, 2) DEFAULT 0,
    net_pay DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'paid')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, pay_period_month, pay_period_year)
);

-- 5. Time off requests table
CREATE TABLE time_off_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- vacation, sick, personal, etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    manager_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_period ON payroll(pay_period_year, pay_period_month);
CREATE INDEX idx_time_off_employee ON time_off_requests(employee_id);
CREATE INDEX idx_time_off_status ON time_off_requests(status);

-- Insert sample data
INSERT INTO users (email, password, name, role) VALUES 
('admin@workora.com', '$2a$10$sample_hashed_password_here', 'Admin User', 'admin'),
('hr@workora.com', '$2a$10$sample_hashed_password_here', 'HR Manager', 'hr'),
('john.doe@workora.com', '$2a$10$sample_hashed_password_here', 'John Doe', 'employee');

INSERT INTO departments (name, description) VALUES 
('Engineering', 'Software development and technical operations'),
('Human Resources', 'Employee relations and organizational development'),
('Marketing', 'Brand promotion and customer engagement'),
('Finance', 'Financial planning and accounting'),
('Sales', 'Revenue generation and client relations');

INSERT INTO employees (name, email, phone, department, position, salary, hire_date, address, emergency_contact) VALUES 
('John Doe', 'john.doe@workora.com', '+1-555-0101', 'Engineering', 'Senior Developer', 85000.00, '2023-01-15', '123 Main St, Anytown, USA', '{"name": "Jane Doe", "phone": "+1-555-0102", "relation": "Spouse"}'),
('Sarah Johnson', 'sarah.johnson@workora.com', '+1-555-0201', 'Human Resources', 'HR Manager', 75000.00, '2022-03-10', '456 Oak Ave, Anytown, USA', '{"name": "Mike Johnson", "phone": "+1-555-0202", "relation": "Husband"}'),
('Mike Chen', 'mike.chen@workora.com', '+1-555-0301', 'Engineering', 'Frontend Developer', 70000.00, '2023-06-01', '789 Pine St, Anytown, USA', '{"name": "Lisa Chen", "phone": "+1-555-0302", "relation": "Wife"}'),
('Emily Davis', 'emily.davis@workora.com', '+1-555-0401', 'Marketing', 'Marketing Specialist', 55000.00, '2023-09-15', '321 Elm St, Anytown, USA', '{"name": "Robert Davis", "phone": "+1-555-0402", "relation": "Father"}'),
('Alex Rodriguez', 'alex.rodriguez@workora.com', '+1-555-0501', 'Sales', 'Sales Representative', 60000.00, '2024-01-08', '654 Maple Dr, Anytown, USA', '{"name": "Maria Rodriguez", "phone": "+1-555-0502", "relation": "Sister"}');

-- Sample attendance data for current month
INSERT INTO attendance (employee_id, date, clock_in, clock_out) VALUES 
(1, CURRENT_DATE, CURRENT_DATE + INTERVAL '8 hours', CURRENT_DATE + INTERVAL '17 hours'),
(2, CURRENT_DATE, CURRENT_DATE + INTERVAL '9 hours', CURRENT_DATE + INTERVAL '18 hours'),
(3, CURRENT_DATE, CURRENT_DATE + INTERVAL '8 hours 30 minutes', CURRENT_DATE + INTERVAL '17 hours 30 minutes'),
(4, CURRENT_DATE, CURRENT_DATE + INTERVAL '8 hours 15 minutes', CURRENT_DATE + INTERVAL '17 hours 15 minutes'),
(5, CURRENT_DATE, CURRENT_DATE + INTERVAL '9 hours 30 minutes', CURRENT_DATE + INTERVAL '18 hours 30 minutes');

-- Update sequences to ensure proper auto-increment
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON payroll FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_off_updated_at BEFORE UPDATE ON time_off_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();