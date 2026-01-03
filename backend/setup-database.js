import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// First, connect to the default 'postgres' database to create our database
const adminPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres', // Connect to default database first
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createDatabase() {
  try {
    console.log('🔍 Checking if database exists...');
    
    // Check if database exists
    const result = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", 
      [process.env.DB_NAME]
    );
    
    if (result.rows.length === 0) {
      console.log(`📦 Creating database '${process.env.DB_NAME}'...`);
      await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log('✅ Database created successfully!');
    } else {
      console.log('✅ Database already exists!');
    }
    
    await adminPool.end();
    
    // Now connect to our new database
    const workPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    
    // Test connection to our database
    const testResult = await workPool.query('SELECT NOW() as current_time');
    console.log('🎉 Connected to Workora database successfully!');
    console.log('⏰ Current time:', testResult.rows[0].current_time);
    
    await workPool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDatabase();