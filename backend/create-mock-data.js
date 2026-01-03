import pool from './config/database.js';
import bcrypt from 'bcryptjs';

async function createMockData() {
  try {
    console.log('🚀 Creating sample data...');

    // 1. Create a test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const userResult = await pool.query(
      'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ['test@workora.com', hashedPassword, 'Test User', 'employee']
    );
    console.log('✅ Created user:', userResult.rows[0]);

    // 2. Create a test employee
    const employeeResult = await pool.query(`
      INSERT INTO employees (name, email, phone, department, position, salary, hire_date, address, emergency_contact) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [
      'John Doe',
      'john.doe@workora.com',
      '+1-555-0123',
      'Engineering',
      'Software Developer',
      75000.00,
      '2024-01-15',
      '123 Main Street, City, State',
      JSON.stringify({
        name: 'Jane Doe',
        phone: '+1-555-0124',
        relation: 'Spouse'
      })
    ]);
    console.log('✅ Created employee:', employeeResult.rows[0]);

    // 3. Create attendance record for today
    const attendanceResult = await pool.query(`
      INSERT INTO attendance (employee_id, date, clock_in, clock_out) 
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [
      employeeResult.rows[0].id,
      new Date().toISOString().split('T')[0],
      new Date(new Date().setHours(9, 0, 0, 0)),
      new Date(new Date().setHours(17, 30, 0, 0))
    ]);
    console.log('✅ Created attendance:', attendanceResult.rows[0]);

    // 4. Create payroll record
    const payrollResult = await pool.query(`
      INSERT INTO payroll (
        employee_id, pay_period_month, pay_period_year, hours_worked, 
        gross_pay, tax_deduction, total_deductions, net_pay
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [
      employeeResult.rows[0].id,
      new Date().getMonth() + 1,
      new Date().getFullYear(),
      160,
      6250.00,
      1250.00,
      1450.00,
      4800.00
    ]);
    console.log('✅ Created payroll:', payrollResult.rows[0]);

    console.log('🎉 Sample data created successfully!');
    
    // Test API endpoints
    console.log('\n📡 Testing API endpoints...');
    console.log('Backend running at: http://localhost:5000');
    console.log('Health check: http://localhost:5000/health');
    console.log('\n🔐 Test login credentials:');
    console.log('Email: test@workora.com');
    console.log('Password: test123');

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  } finally {
    await pool.end();
  }
}

createMockData();