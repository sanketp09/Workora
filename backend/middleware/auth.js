import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Optional: Verify user still exists and is active
    const user = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = $1', 
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    req.user = {
      id: decoded.userId,
      role: decoded.role,
      ...user.rows[0]
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};