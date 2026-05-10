const mysql = require('mysql2/promise');

const pool = mysql.createPool(process.env.DATABASE_URL);

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected via pool");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

const getDB = () => {
  return pool;
};

const testConnection = async () => {
  await connectDB();
};

module.exports = {
  pool,
  connectDB,
  testConnection,
  getDB
};