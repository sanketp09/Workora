const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, adminOrHRMiddleware } = require('../middleware/auth');

// Password Generator Function
const generatePassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#$%&*';
  
  const all = upper + lower + numbers + special;
  let password = '';
  
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = 4; i < 12; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Create Employee (Admin/HR only)
router.post('/create', authMiddleware, adminOrHRMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { first_name, last_name, email, year_of_joining, role } = req.body;

    // Validate input
    if (!first_name || !last_name || !email || !year_of_joining) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if email already exists
    const emailCheck = await client.query(
      'SELECT id FROM employees WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    await client.query('BEGIN');

    // Generate Login ID using database function
    const loginIdResult = await client.query(
      'SELECT generate_login_id($1, $2, $3) as login_id',
      [first_name, last_name, year_of_joining]
    );
    const loginId = loginIdResult.rows[0].login_id;

    // Generate temporary password
    const tempPassword = generatePassword();

    // Get serial number
    const serialResult = await client.query(
      'SELECT get_next_serial_number($1) as serial',
      [year_of_joining]
    );
    const serialNumber = serialResult.rows[0].serial;

    // Insert employee with hashed password
    const insertResult = await client.query(
      `INSERT INTO employees (
        login_id, email, password_hash, first_name, last_name, 
        year_of_joining, serial_number, role, must_change_password
      ) VALUES ($1, $2, crypt($3, gen_salt('bf')), $4, $5, $6, $7, $8, TRUE)
      RETURNING id, login_id, email, first_name, last_name, role`,
      [loginId, email, tempPassword, first_name, last_name, year_of_joining, serialNumber, role || 'employee']
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Employee created successfully',
      employee: insertResult.rows[0],
      login_id: loginId,
      password: tempPassword
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee'
    });
  } finally {
    client.release();
  }
});

// Get Employee by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, login_id, email, first_name, last_name, 
              year_of_joining, role, created_at
       FROM employees 
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      employee: result.rows[0]
    });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee'
    });
  }
});

// Get All Employees (Admin/HR only)
router.get('/', authMiddleware, adminOrHRMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, login_id, email, first_name, last_name, 
              year_of_joining, role, created_at
       FROM employees 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      employees: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees'
    });
  }
});

module.exports = router;
