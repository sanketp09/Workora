import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create notifications table if it doesn't exist
const initNotificationsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        related_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_employee ON notifications(employee_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
    `);
  } catch (error) {
    console.error('Error creating notifications table:', error);
  }
};

// Initialize table on module load
initNotificationsTable();

// Get notifications for an employee
router.get('/employee/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { unreadOnly } = req.query;
    
    let query = `
      SELECT * FROM notifications 
      WHERE employee_id = $1
    `;
    
    if (unreadOnly === 'true') {
      query += ` AND read = false`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT 50`;
    
    const result = await pool.query(query, [employeeId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get all notifications (for admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.*, e.name as employee_name 
      FROM notifications n
      LEFT JOIN employees e ON n.employee_id = e.id
      ORDER BY n.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create a notification
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { employee_id, type, title, message, related_id } = req.body;
    
    const result = await pool.query(
      `INSERT INTO notifications (employee_id, type, title, message, related_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [employee_id, type, title, message, related_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE notifications SET read = true WHERE id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read for an employee
router.put('/employee/:employeeId/read-all', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    await pool.query(
      `UPDATE notifications SET read = true WHERE employee_id = $1`,
      [employeeId]
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Get unread count for an employee
router.get('/employee/:employeeId/unread-count', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications WHERE employee_id = $1 AND read = false`,
      [employeeId]
    );
    
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

export default router;
