const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  try {
    console.log('⏳ Connecting to MySQL server...');
    const connection = await mysql.createConnection(connectionConfig);

    console.log(`⏳ Creating database "${process.env.DB_NAME}" if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.query(`USE \`${process.env.DB_NAME}\`;`);

    console.log('⏳ Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon, but be careful with triggers or procedures if they were present
    // For this schema, simple split by semicolon works as there are no DELIMITER changes
    const statements = schema
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`⏳ Executing ${statements.length} SQL statements...`);
    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log('✅ Database setup completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error setting up database:');
    console.error(error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\nTIP: Make sure your MySQL server is running.');
    }
    process.exit(1);
  }
}

setupDatabase();
