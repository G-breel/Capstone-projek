const { pool } = require('./database');

/**
 * Jalankan migrasi database otomatis saat server start.
 * Mengubah kolom `avatar` di tabel `users` dari VARCHAR(255)
 * ke MEDIUMTEXT agar bisa menyimpan data gambar Base64.
 */
const runMigrations = async () => {
  try {
    console.log('🔍 Checking database structure...');

    // 1. Migrasi kolom avatar (Sudah ada sebelumnya)
    const [avatarRows] = await pool.execute(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'avatar'
    `);

    if (avatarRows.length > 0) {
      const columnType = avatarRows[0].COLUMN_TYPE.toLowerCase();
      if (columnType !== 'mediumtext' && columnType !== 'longtext') {
        console.log('🔄 Running migration: alter avatar column to MEDIUMTEXT...');
        await pool.execute(`ALTER TABLE users MODIFY COLUMN avatar MEDIUMTEXT NULL`);
        console.log('✅ Migration success: avatar column is now MEDIUMTEXT');
      }
    }

    // 2. Migrasi kolom password (Membolehkan NULL untuk Google Login)
    const [passwordRows] = await pool.execute(`
      SELECT IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'password'
    `);

    if (passwordRows.length > 0 && passwordRows[0].IS_NULLABLE === 'NO') {
      console.log('🔄 Running migration: making password column NULLABLE...');
      await pool.execute(`ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL`);
      console.log('✅ Migration success: password column is now NULLABLE');
    }

    // 3. Migrasi kolom google_id (Menambah jika belum ada)
    const [googleIdRows] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME = 'google_id'
    `);

    if (googleIdRows.length === 0) {
      console.log('🔄 Running migration: adding google_id column...');
      await pool.execute(`ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER email`);
      console.log('✅ Migration success: google_id column added');
    }

    console.log('✨ All migrations checked and up to date.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
};

module.exports = { runMigrations };
