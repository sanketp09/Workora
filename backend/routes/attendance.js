import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get attendance records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { employee_id, start_date, end_date } = req.query;
    let query = `
      SELECT a.*, e.name as employee_name, e.department 
      FROM attendance a 
      JOIN employees e ON a.employee_id = e.id 
      WHERE 1=1
    `;
    const params = [];

    if (employee_id) {
      params.push(employee_id);
      query += ` AND a.employee_id = $${params.length}`;
    }

    if (start_date) {
      params.push(start_date);
      query += ` AND a.date >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND a.date <= $${params.length}`;
    }

    query += ' ORDER BY a.date DESC, e.name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Clock in/out
router.post('/clock', authenticateToken, async (req, res) => {
  try {
    const { employee_id, type } = req.body; // type: 'in' or 'out'
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (type === 'in') {
      // Check if already clocked in today
      const existing = await pool.query(
        'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
        [employee_id, today]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Already clocked in today' });
      }

      const result = await pool.query(
        'INSERT INTO attendance (employee_id, date, clock_in) VALUES ($1, $2, $3) RETURNING *',
        [employee_id, today, now]
      );

      res.status(201).json({
        message: 'Clocked in successfully',
        attendance: result.rows[0]
      });
    } else if (type === 'out') {
      const result = await pool.query(
        'UPDATE attendance SET clock_out = $1, updated_at = CURRENT_TIMESTAMP WHERE employee_id = $2 AND date = $3 AND clock_out IS NULL RETURNING *',
        [now, employee_id, today]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'No clock-in record found for today' });
      }

      res.json({
        message: 'Clocked out successfully',
        attendance: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Error clocking in/out:', error);
    res.status(500).json({ error: 'Failed to clock in/out' });
  }
});

// Get attendance by employee ID
router.get('/employee/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await pool.query(
      `SELECT a.*, e.name as employee_name, e.department 
       FROM attendance a 
       JOIN employees e ON a.employee_id = e.id 
       WHERE a.employee_id = $1 
       ORDER BY a.date DESC`,
      [employeeId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({ error: 'Failed to fetch employee attendance' });
  }
});

// Get attendance summary
router.get('/summary/:employee_id', authenticateToken, async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { month, year } = req.query;
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN clock_in IS NOT NULL THEN 1 END) as present_days,
        COUNT(CASE WHEN clock_out IS NULL AND clock_in IS NOT NULL THEN 1 END) as incomplete_days,
        AVG(EXTRACT(EPOCH FROM (clock_out - clock_in))/3600) as avg_hours_per_day
       FROM attendance 
       WHERE employee_id = $1 
       AND EXTRACT(MONTH FROM date) = $2 
       AND EXTRACT(YEAR FROM date) = $3`,
      [employee_id, month, year]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
});

export default router;