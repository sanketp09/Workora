import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

async function setupDatabase() {
  console.log('🚀 Setting up Workora Database...');
  
  // Check if .env file exists
  if (!fs.existsSync('.env')) {
    console.log('❌ .env file not found!');
    console.log('📝 Please copy .env.example to .env and update the database credentials');
    console.log('   cp .env.example .env');
    process.exit(1);
  }

  // Validate required environment variables
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('❌ Missing required environment variables:');
    missing.forEach(key => console.log(`   - ${key}`));
    console.log('📝 Please update your .env file');
    process.exit(1);
  }

  try {
    // First connect to postgres database to create our database
    const adminPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: 'postgres', // Default database
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('🔍 Checking database connection...');
    
    // Test connection
    await adminPool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL');

    // Check if our database exists
    const dbExists = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [process.env.DB_NAME]
    );

    if (dbExists.rows.length === 0) {
      console.log(`📦 Creating database: ${process.env.DB_NAME}`);
      await adminPool.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log('✅ Database created');
    } else {
      console.log('✅ Database already exists');
    }

    await adminPool.end();

    // Now connect to our application database
    const appPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('🔧 Setting up database schema...');
    
    // Read and execute the schema file
    const schemaPath = path.join(process.cwd(), 'database-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await appPool.query(schema);
      console.log('✅ Database schema created');
    } else {
      console.log('⚠️  database-schema.sql not found, creating basic tables...');
      await createBasicTables(appPool);
    }

    // Create sample data
    console.log('👤 Creating sample user...');
    await createSampleData(appPool);

    await appPool.end();
    console.log('🎉 Database setup complete!');
    console.log('');
    console.log('🔐 Sample login credentials:');
    console.log('   Email: admin@workora.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🚀 You can now start the application:');
    console.log('   npm run dev:backend');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('');
    console.log('💡 Common solutions:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your database credentials in .env');
    console.log('   3. Ensure your user has database creation privileges');
    process.exit(1);
  }
}

async function createBasicTables(pool) {
  const createTables = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      employee_id VARCHAR(50),
      role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'hr', 'employee')),
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      avatar_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Departments table
    CREATE TABLE IF NOT EXISTS departments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      manager_id UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Positions table
    CREATE TABLE IF NOT EXISTS positions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(100) NOT NULL,
      department_id UUID REFERENCES departments(id),
      level VARCHAR(50),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Employees table
    CREATE TABLE IF NOT EXISTS employees (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      department_id UUID REFERENCES departments(id),
      position_id UUID REFERENCES positions(id),
      phone VARCHAR(20),
      address TEXT,
      date_of_birth DATE,
      join_date DATE,
      emergency_contact_name VARCHAR(255),
      emergency_contact_phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Attendance records table
    CREATE TABLE IF NOT EXISTS attendance_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id UUID REFERENCES employees(id),
      date DATE NOT NULL,
      check_in_time TIME,
      check_out_time TIME,
      break_duration INTEGER DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await pool.query(createTables);
}

async function createSampleData(pool) {
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.default.hash('admin123', 10);
  
  // Create admin user
  await pool.query(`
    INSERT INTO users (email, password_hash, name, employee_id, role) 
    VALUES ($1, $2, $3, $4, $5) 
    ON CONFLICT (email) DO NOTHING
  `, ['admin@workora.com', hashedPassword, 'Admin User', 'ADMIN001', 'admin']);

  // Create sample department
  const deptResult = await pool.query(`
    INSERT INTO departments (name, description) 
    VALUES ($1, $2) 
    ON CONFLICT (name) DO NOTHING
    RETURNING id
  `, ['Engineering', 'Software Development Department']);

  if (deptResult.rows.length > 0) {
    // Create sample position
    await pool.query(`
      INSERT INTO positions (title, department_id, description) 
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
    `, ['Software Developer', deptResult.rows[0].id, 'Full Stack Developer Position']);
  }
}

setupDatabase();