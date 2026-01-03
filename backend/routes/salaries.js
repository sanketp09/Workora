import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all salaries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id as employee_id, e.name, e.department, e.position, e.salary as wage,
             e.salary * 0.5 as basic,
             e.salary * 0.25 as hra,
             e.salary * 0.0833 as allowance,
             e.salary * 0.0833 as bonus,
             e.salary * 0.0833 as lta
      FROM employees e
      ORDER BY e.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching salaries:', error);
    res.status(500).json({ error: 'Failed to fetch salaries' });
  }
});

// Get salary by employee ID
router.get('/employee/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const result = await pool.query(`
      SELECT e.id as employee_id, e.name, e.department, e.position, e.salary as wage,
             e.salary * 0.5 as basic,
             e.salary * 0.25 as hra,
             e.salary * 0.0833 as allowance,
             e.salary * 0.0833 as bonus,
             e.salary * 0.0833 as lta
      FROM employees e
      WHERE e.id = $1
    `, [employeeId]);

    if (result.rows.length === 0) {
      // Return default salary structure if employee not found
      return res.json({
        wage: 50000,
        basic: 25000,
        hra: 12500,
        allowance: 4167,
        bonus: 4167,
        lta: 4167
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching employee salary:', error);
    res.status(500).json({ error: 'Failed to fetch employee salary' });
  }
});

// Update employee salary
router.put('/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { wage } = req.body;

    const result = await pool.query(
      'UPDATE employees SET salary = $1 WHERE id = $2 RETURNING *',
      [wage, employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      message: 'Salary updated successfully',
      employee: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ error: 'Failed to update salary' });
  }
});

export default router;
