import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

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

// Create new employee
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name, email, phone, department, position, 
      salary, hire_date, address, emergency_contact
    } = req.body;

    const result = await pool.query(
      `INSERT INTO employees (name, email, phone, department, position, salary, hire_date, address, emergency_contact) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, email, phone, department, position, salary, hire_date, address, emergency_contact]
    );

    res.status(201).json({
      message: 'Employee created successfully',
      employee: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
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