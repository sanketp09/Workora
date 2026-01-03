import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get current date info
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const [employeeStats, attendanceStats, payrollStats, departmentStats] = await Promise.all([
      // Employee statistics
      pool.query(`
        SELECT 
          COUNT(*) as total_employees,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
          COUNT(CASE WHEN DATE(hire_date) >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as new_hires_this_month
        FROM employees
      `),
      
      // Attendance statistics
      pool.query(`
        SELECT 
          COUNT(DISTINCT employee_id) as present_today,
          COUNT(CASE WHEN clock_out IS NULL AND clock_in IS NOT NULL THEN 1 END) as still_working,
          AVG(EXTRACT(EPOCH FROM (clock_out - clock_in))/3600) as avg_hours_today
        FROM attendance 
        WHERE date = CURRENT_DATE
      `),
      
      // Payroll statistics
      pool.query(`
        SELECT 
          COUNT(*) as processed_payrolls,
          SUM(gross_pay) as total_gross_pay,
          SUM(net_pay) as total_net_pay,
          AVG(net_pay) as avg_net_pay
        FROM payroll 
        WHERE pay_period_month = $1 AND pay_period_year = $2
      `, [currentMonth, currentYear]),
      
      // Department statistics
      pool.query(`
        SELECT 
          department,
          COUNT(*) as employee_count,
          AVG(salary) as avg_salary
        FROM employees 
        WHERE status = 'active'
        GROUP BY department
        ORDER BY employee_count DESC
      `)
    ]);

    res.json({
      employees: employeeStats.rows[0],
      attendance: attendanceStats.rows[0],
      payroll: payrollStats.rows[0],
      departments: departmentStats.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Recent activities
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const recentActivities = await pool.query(`
      (
        SELECT 
          'attendance' as type,
          e.name as employee_name,
          'Clocked in at ' || TO_CHAR(a.clock_in, 'HH24:MI') as activity,
          a.date as activity_date,
          a.clock_in as activity_time
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.date >= CURRENT_DATE - INTERVAL '7 days'
        AND a.clock_in IS NOT NULL
      )
      UNION ALL
      (
        SELECT 
          'payroll' as type,
          e.name as employee_name,
          'Payroll processed for ' || p.pay_period_month || '/' || p.pay_period_year as activity,
          p.created_at::date as activity_date,
          p.created_at as activity_time
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
        WHERE p.created_at >= CURRENT_DATE - INTERVAL '7 days'
      )
      ORDER BY activity_time DESC
      LIMIT 20
    `);

    res.json(recentActivities.rows);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

// Attendance trends (last 30 days)
router.get('/attendance-trends', authenticateToken, async (req, res) => {
  try {
    const trends = await pool.query(`
      SELECT 
        date,
        COUNT(DISTINCT employee_id) as present_count,
        AVG(EXTRACT(EPOCH FROM (clock_out - clock_in))/3600) as avg_hours
      FROM attendance 
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      AND clock_in IS NOT NULL
      GROUP BY date
      ORDER BY date
    `);

    res.json(trends.rows);
  } catch (error) {
    console.error('Error fetching attendance trends:', error);
    res.status(500).json({ error: 'Failed to fetch attendance trends' });
  }
});

export default router;