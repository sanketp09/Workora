import pool from './config/database.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function insertMockData() {
  try {
    console.log('🚀 Inserting mock data with correct schema...');
    
    // Create a user with proper UUID and columns
    const hashedPassword = await bcrypt.hash('test123', 10);
    const userId = randomUUID();
    
    const userResult = await pool.query(
      'INSERT INTO users (id, email, password_hash, name, employee_id, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, 'test@workora.com', hashedPassword, 'Test User', 'EMP001', 'employee', 'active']
    );
    console.log('✅ Created user:', userResult.rows[0]);
    
    // Check if departments and positions exist first
    let departmentId = randomUUID();
    let positionId = randomUUID();
    
    // Try to create a department
    try {
      const deptResult = await pool.query(
        'INSERT INTO departments (id, name, description) VALUES ($1, $2, $3) RETURNING *',
        [departmentId, 'Engineering', 'Software Development Department']
      );
      console.log('✅ Created department:', deptResult.rows[0]);
    } catch (err) {
      console.log('ℹ️ Department might already exist or different schema');
    }
    
    // Try to create a position
    try {
      const posResult = await pool.query(
        'INSERT INTO positions (id, title, department_id, description) VALUES ($1, $2, $3, $4) RETURNING *',
        [positionId, 'Software Developer', departmentId, 'Full Stack Developer Position']
      );
      console.log('✅ Created position:', posResult.rows[0]);
    } catch (err) {
      console.log('ℹ️ Position might already exist or different schema');
    }
    
    // Create an employee
    const employeeId = randomUUID();
    const empResult = await pool.query(
      'INSERT INTO employees (id, user_id, department_id, position_id, phone, address, date_of_birth, join_date, emergency_contact_name, emergency_contact_phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [
        employeeId,
        userId,
        departmentId,
        positionId,
        '+1-555-0123',
        '123 Main Street, City, State 12345',
        '1990-05-15',
        '2024-01-15',
        'Jane Doe',
        '+1-555-0124'
      ]
    );
    console.log('✅ Created employee:', empResult.rows[0]);
    
    // Create an attendance record
    try {
      const attendanceId = randomUUID();
      const attResult = await pool.query(
        'INSERT INTO attendance_records (id, employee_id, date, check_in_time, check_out_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [
          attendanceId,
          employeeId,
          new Date().toISOString().split('T')[0],
          '09:00:00',
          '17:30:00'
        ]
      );
      console.log('✅ Created attendance record:', attResult.rows[0]);
    } catch (err) {
      console.log('ℹ️ Could not create attendance:', err.message);
    }
    
    // Final count
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const empCount = await pool.query('SELECT COUNT(*) as count FROM employees');
    
    console.log('\n🎉 Mock data created successfully!');
    console.log(`📊 Total users: ${userCount.rows[0].count}`);
    console.log(`📊 Total employees: ${empCount.rows[0].count}`);
    
    console.log('\n🔐 Test credentials:');
    console.log('Email: test@workora.com');
    console.log('Password: test123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

insertMockData();