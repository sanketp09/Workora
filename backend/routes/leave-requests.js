import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all leave requests (for admin/HR)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, employee_id } = req.query;
    let query = `
      SELECT t.*, e.name as employee_name, e.department, e.email as employee_email
      FROM time_off_requests t
      JOIN employees e ON t.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }

    if (employee_id) {
      params.push(employee_id);
      query += ` AND t.employee_id = $${params.length}`;
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// Get leave requests by employee
router.get('/employee/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await pool.query(
      `SELECT t.*, e.name as employee_name, e.department
       FROM time_off_requests t
       JOIN employees e ON t.employee_id = e.id
       WHERE t.employee_id = $1
       ORDER BY t.created_at DESC`,
      [employeeId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching employee leave requests:', error);
    res.status(500).json({ error: 'Failed to fetch employee leave requests' });
  }
});

// Create leave request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { employee_id, type, start_date, end_date, days_requested, reason } = req.body;

    const result = await pool.query(
      `INSERT INTO time_off_requests 
       (employee_id, type, start_date, end_date, days_requested, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [employee_id, type, start_date, end_date, days_requested, reason]
    );

    // Get employee name for response
    const employee = await pool.query('SELECT name, department FROM employees WHERE id = $1', [employee_id]);
    
    const leaveRequest = {
      ...result.rows[0],
      employee_name: employee.rows[0]?.name,
      department: employee.rows[0]?.department
    };

    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

// Update leave request status (approve/deny)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason, admin_comment } = req.body;
    const approved_by = req.user?.userId || null;

    // Cast status explicitly to varchar to avoid type mismatch
    const result = await pool.query(
      `UPDATE time_off_requests 
       SET status = $1::varchar, 
           approved_by = $2, 
           approved_at = CASE WHEN $1::varchar IN ('approved', 'denied') THEN CURRENT_TIMESTAMP ELSE approved_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, approved_by, parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const leaveRequest = result.rows[0];
    
    // Create notification for the employee
    try {
      const notificationTitle = status === 'approved' 
        ? 'Leave Request Approved ✓' 
        : 'Leave Request Denied ✗';
      
      let notificationMessage = status === 'approved'
        ? `Your leave request from ${new Date(leaveRequest.start_date).toLocaleDateString()} to ${new Date(leaveRequest.end_date).toLocaleDateString()} has been approved.`
        : `Your leave request from ${new Date(leaveRequest.start_date).toLocaleDateString()} to ${new Date(leaveRequest.end_date).toLocaleDateString()} has been denied.`;
      
      if (admin_comment) {
        notificationMessage += ` Comment: ${admin_comment}`;
      }
      if (rejection_reason) {
        notificationMessage += ` Reason: ${rejection_reason}`;
      }
      
      await pool.query(
        `INSERT INTO notifications (employee_id, type, title, message, related_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [leaveRequest.employee_id, 'leave_status', notificationTitle, notificationMessage, leaveRequest.id]
      );
    } catch (notifError) {
      console.error('Error creating notification (table may not exist):', notifError.message);
      // Continue even if notification fails
    }

    res.json(leaveRequest);
  } catch (error) {
    console.error('Error updating leave request status:', error);
    res.status(500).json({ error: 'Failed to update leave request status' });
  }
});

// Get leave balance for an employee
router.get('/balance/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const currentYear = new Date().getFullYear();

    // Calculate used leave days by type
    const usedLeave = await pool.query(
      `SELECT type, SUM(days_requested) as used_days
       FROM time_off_requests
       WHERE employee_id = $1 
       AND status = 'approved'
       AND EXTRACT(YEAR FROM start_date) = $2
       GROUP BY type`,
      [employeeId, currentYear]
    );

    // Default leave balance
    const balance = {
      paid: 12,
      sick: 6,
      paidUsed: 0,
      sickUsed: 0,
      unpaidUsed: 0
    };

    usedLeave.rows.forEach(row => {
      if (row.type === 'paid' || row.type === 'vacation') {
        balance.paidUsed = parseInt(row.used_days);
      } else if (row.type === 'sick') {
        balance.sickUsed = parseInt(row.used_days);
      } else if (row.type === 'unpaid') {
        balance.unpaidUsed = parseInt(row.used_days);
      }
    });

    res.json(balance);
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ error: 'Failed to fetch leave balance' });
  }
});

export default router;
