import pool from './config/database.js';
import bcrypt from 'bcryptjs';

async function createMockEntry() {
  try {
    console.log('🚀 Creating mock entry...');
    
    // Check columns in users table first
    const userColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('👤 Users table columns:', userColumns.rows.map(c => `${c.column_name} (${c.data_type})`));
    
    // Check columns in employees table
    const empColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'employees'
      ORDER BY ordinal_position
    `);
    console.log('👥 Employees table columns:', empColumns.rows.map(c => `${c.column_name} (${c.data_type})`));
    
    // Create a test user (adjust columns based on what we see)
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Try to insert a user - will adjust based on actual columns
    let userResult;
    try {
      userResult = await pool.query(
        'INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        ['testuser', 'test@workora.com', hashedPassword, 'Test', 'User', 'employee']
      );
      console.log('✅ Created user:', userResult.rows[0]);
    } catch (err) {
      console.log('ℹ️ Trying different user column structure...');
      console.log('Error:', err.message);
      
      // Try alternative column names
      try {
        userResult = await pool.query(
          'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
          ['test@workora.com', hashedPassword, 'Test User', 'employee']
        );
        console.log('✅ Created user (alt structure):', userResult.rows[0]);
      } catch (err2) {
        console.log('❌ Could not create user:', err2.message);
      }
    }
    
    // Create a test employee
    try {
      const empResult = await pool.query(
        'INSERT INTO employees (first_name, last_name, email, phone, department_id, position_id, hire_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        ['John', 'Doe', 'john.doe@workora.com', '+1-555-0123', 1, 1, '2024-01-15']
      );
      console.log('✅ Created employee:', empResult.rows[0]);
    } catch (err) {
      console.log('ℹ️ Trying different employee column structure...');
      console.log('Error:', err.message);
    }
    
    // Check if data was inserted
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    const empCount = await pool.query('SELECT COUNT(*) as count FROM employees');
    
    console.log(`📊 Total users: ${userCount.rows[0].count}`);
    console.log(`📊 Total employees: ${empCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createMockEntry();