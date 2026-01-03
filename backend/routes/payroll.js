import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get payroll records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { employee_id, month, year } = req.query;
    let query = `
      SELECT p.*, e.name as employee_name, e.department, e.position
      FROM payroll p 
      JOIN employees e ON p.employee_id = e.id 
      WHERE 1=1
    `;
    const params = [];

    if (employee_id) {
      params.push(employee_id);
      query += ` AND p.employee_id = $${params.length}`;
    }

    if (month) {
      params.push(month);
      query += ` AND p.pay_period_month = $${params.length}`;
    }

    if (year) {
      params.push(year);
      query += ` AND p.pay_period_year = $${params.length}`;
    }

    query += ' ORDER BY p.pay_period_year DESC, p.pay_period_month DESC, e.name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ error: 'Failed to fetch payroll records' });
  }
});

// Generate payroll for employee
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { employee_id, pay_period_month, pay_period_year, hours_worked, overtime_hours = 0 } = req.body;

    // Get employee details
    const employee = await pool.query(
      'SELECT * FROM employees WHERE id = $1',
      [employee_id]
    );

    if (employee.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const emp = employee.rows[0];
    const hourly_rate = emp.salary / (52 * 40); // Assuming annual salary
    const regular_pay = hours_worked * hourly_rate;
    const overtime_pay = overtime_hours * hourly_rate * 1.5;
    const gross_pay = regular_pay + overtime_pay;
    
    // Calculate deductions (simplified)
    const tax_deduction = gross_pay * 0.2; // 20% tax
    const insurance_deduction = 200; // Fixed insurance
    const total_deductions = tax_deduction + insurance_deduction;
    const net_pay = gross_pay - total_deductions;

    const result = await pool.query(
      `INSERT INTO payroll (
        employee_id, pay_period_month, pay_period_year, hours_worked, overtime_hours,
        gross_pay, tax_deduction, insurance_deduction, total_deductions, net_pay
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        employee_id, pay_period_month, pay_period_year, hours_worked, overtime_hours,
        gross_pay, tax_deduction, insurance_deduction, total_deductions, net_pay
      ]
    );

    res.status(201).json({
      message: 'Payroll generated successfully',
      payroll: result.rows[0]
    });
  } catch (error) {
    console.error('Error generating payroll:', error);
    res.status(500).json({ error: 'Failed to generate payroll' });
  }
});

// Update payroll
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { hours_worked, overtime_hours, bonus = 0 } = req.body;

    // Recalculate pay based on updated hours
    const payroll = await pool.query('SELECT * FROM payroll WHERE id = $1', [id]);
    if (payroll.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    const employee = await pool.query(
      'SELECT salary FROM employees WHERE id = $1',
      [payroll.rows[0].employee_id]
    );

    const hourly_rate = employee.rows[0].salary / (52 * 40);
    const regular_pay = hours_worked * hourly_rate;
    const overtime_pay = overtime_hours * hourly_rate * 1.5;
    const gross_pay = regular_pay + overtime_pay + bonus;
    
    const tax_deduction = gross_pay * 0.2;
    const insurance_deduction = 200;
    const total_deductions = tax_deduction + insurance_deduction;
    const net_pay = gross_pay - total_deductions;

    const result = await pool.query(
      `UPDATE payroll SET 
       hours_worked = $1, overtime_hours = $2, gross_pay = $3,
       tax_deduction = $4, total_deductions = $5, net_pay = $6,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [hours_worked, overtime_hours, gross_pay, tax_deduction, total_deductions, net_pay, id]
    );

    res.json({
      message: 'Payroll updated successfully',
      payroll: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating payroll:', error);
    res.status(500).json({ error: 'Failed to update payroll' });
  }
});

export default router;