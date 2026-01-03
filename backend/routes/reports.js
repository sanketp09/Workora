import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Employee reports
router.get('/employees', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        department,
        COUNT(*) as total_employees,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
        AVG(salary) as avg_salary
      FROM employees 
      GROUP BY department
      ORDER BY total_employees DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employee reports:', error);
    res.status(500).json({ error: 'Failed to fetch employee reports' });
  }
});

// Attendance reports
router.get('/attendance', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const result = await pool.query(`
      SELECT 
        e.department,
        e.name as employee_name,
        COUNT(a.id) as days_present,
        COUNT(CASE WHEN a.clock_out IS NULL AND a.clock_in IS NOT NULL THEN 1 END) as incomplete_days,
        AVG(EXTRACT(EPOCH FROM (a.clock_out - a.clock_in))/3600) as avg_hours_per_day
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id 
        AND EXTRACT(MONTH FROM a.date) = $1 
        AND EXTRACT(YEAR FROM a.date) = $2
      WHERE e.status = 'active'
      GROUP BY e.id, e.name, e.department
      ORDER BY e.department, e.name
    `, [month || new Date().getMonth() + 1, year || new Date().getFullYear()]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attendance reports:', error);
    res.status(500).json({ error: 'Failed to fetch attendance reports' });
  }
});

// Payroll reports
router.get('/payroll', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const result = await pool.query(`
      SELECT 
        e.department,
        e.name as employee_name,
        p.gross_pay,
        p.net_pay,
        p.total_deductions,
        p.hours_worked,
        p.overtime_hours
      FROM payroll p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.pay_period_month = $1 AND p.pay_period_year = $2
      ORDER BY e.department, e.name
    `, [month || new Date().getMonth() + 1, year || new Date().getFullYear()]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payroll reports:', error);
    res.status(500).json({ error: 'Failed to fetch payroll reports' });
  }
});

// Summary statistics
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const [employeeStats, attendanceStats, payrollStats] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN status = \'active\' THEN 1 END) as active FROM employees'),
      pool.query(`
        SELECT 
          COUNT(DISTINCT employee_id) as employees_clocked_today,
          COUNT(*) as total_attendance_today
        FROM attendance 
        WHERE date = CURRENT_DATE
      `),
      pool.query(`
        SELECT 
          COUNT(*) as payrolls_processed,
          SUM(gross_pay) as total_gross_pay,
          SUM(net_pay) as total_net_pay
        FROM payroll 
        WHERE pay_period_month = EXTRACT(MONTH FROM CURRENT_DATE)
        AND pay_period_year = EXTRACT(YEAR FROM CURRENT_DATE)
      `)
    ]);

    res.json({
      employees: employeeStats.rows[0],
      attendance: attendanceStats.rows[0],
      payroll: payrollStats.rows[0]
    });
  } catch (error) {
    console.error('Error fetching summary reports:', error);
    res.status(500).json({ error: 'Failed to fetch summary reports' });
  }
});

export default router;