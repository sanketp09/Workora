import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate employee login ID
const generateLoginId = async (firstName, lastName, year) => {
  const result = await pool.query('SELECT COUNT(*) as count FROM employees');
  const count = parseInt(result.rows[0].count) + 1;
  const serial = String(count).padStart(3, '0');
  return `OI${firstName.toUpperCase().slice(0, 2)}${lastName.toUpperCase().slice(0, 2)}${year}${serial}`;
};

// Helper function to generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, department, position, salary, hire_date, status FROM employees ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM employees WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create new employee with user account
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name, email, phone, department, position, 
      salary, hire_date, address, emergency_contact, role = 'employee'
    } = req.body;

    // Check if email already exists
    const emailExists = await pool.query('SELECT id FROM employees WHERE email = $1', [email]);
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }

    // Generate login credentials
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts[nameParts.length - 1] || 'Employee';
    const year = hire_date ? new Date(hire_date).getFullYear() : new Date().getFullYear();
    
    const loginId = await generateLoginId(firstName, lastName, year);
    const tempPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create employee record
    const employeeResult = await pool.query(
      `INSERT INTO employees (name, email, phone, department, position, salary, hire_date, address, emergency_contact) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, email, phone, department, position, salary || 50000, hire_date || new Date(), address, emergency_contact]
    );

    const employee = employeeResult.rows[0];

    // Create user account for login
    const userResult = await pool.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) RETURNING id, email, name, role`,
      [email, hashedPassword, name, role]
    );

    // Update employee with user reference and login_id
    await pool.query(
      `UPDATE employees SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [employee.id]
    );

    res.status(201).json({
      message: 'Employee created successfully',
      employee: {
        ...employee,
        login_id: loginId
      },
      credentials: {
        loginId: loginId,
        email: email,
        tempPassword: tempPassword
      }
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee: ' + error.message });
  }
});

// Update employee
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email, phone, department, position,
      salary, address, emergency_contact, status
    } = req.body;

    const result = await pool.query(
      `UPDATE employees SET 
       name = $1, email = $2, phone = $3, department = $4, position = $5,
       salary = $6, address = $7, emergency_contact = $8, status = $9,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [name, email, phone, department, position, salary, address, emergency_contact, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      message: 'Employee updated successfully',
      employee: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE employees SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['inactive', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;