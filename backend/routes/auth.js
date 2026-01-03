const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { login_id, password } = req.body;

    if (!login_id || !password) {
      return res.status(400).json({
        success: false,
        message: 'Login ID and password are required'
      });
    }

    // Verify password using pgcrypto function
    const result = await pool.query(
      'SELECT * FROM verify_password($1, $2)',
      [login_id.toUpperCase(), password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Login ID or Password'
      });
    }

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.employee_id,
        login_id: user.login_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.employee_id,
        login_id: user.login_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        must_change_password: user.must_change_password
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change Password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { new_password } = req.body;
    const userId = req.user.id;

    if (!new_password || new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Update password using pgcrypto
    await pool.query(
      `UPDATE employees 
       SET password_hash = crypt($1, gen_salt('bf')),
           must_change_password = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [new_password, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Get Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, login_id, email, first_name, last_name, role, 
              must_change_password, created_at
       FROM employees 
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: result.rows[0].id,
        login_id: result.rows[0].login_id,
        email: result.rows[0].email,
        first_name: result.rows[0].first_name,
        last_name: result.rows[0].last_name,
        role: result.rows[0].role,
        must_change_password: result.rows[0].must_change_password,
        created_at: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

module.exports = router;
