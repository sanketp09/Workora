import pool from './config/database.js';

async function checkTables() {
  try {
    console.log('🔍 Checking existing tables...');
    
    // Get all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Found tables:', tables.rows.map(t => t.table_name));
    
    // Check a few common table structures
    const commonTables = ['res_users', 'hr_employee', 'hr_attendance'];
    
    for (const tableName of commonTables) {
      try {
        const columns = await pool.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [tableName]);
        
        if (columns.rows.length > 0) {
          console.log(`\n📋 Table: ${tableName}`);
          columns.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
          });
        }
      } catch (err) {
        // Table doesn't exist, skip
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();