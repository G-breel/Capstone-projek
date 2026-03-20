const { pool } = require('../config/database');

class Wishlist {
  static async create({ userId, name, targetAmount, savedAmount = 0 }) {
    const [result] = await pool.execute(
      `INSERT INTO wishlists (user_id, name, target_amount, saved_amount) 
       VALUES (?, ?, ?, ?)`,
      [userId, name, targetAmount, savedAmount]
    );
    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM wishlists WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByUser(userId, search = '') {
    let query = 'SELECT * FROM wishlists WHERE user_id = ?';
    const params = [userId];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async update(id, userId, updates) {
  try {
    console.log('📦 MODEL UPDATE - Input:', { id, userId, updates });
    
    const allowedUpdates = ['name', 'target_amount', 'saved_amount'];
    const fields = [];
    const values = [];

    // Konversi camelCase ke snake_case jika perlu
    for (const [key, value] of Object.entries(updates)) {
      let dbKey = key;
      
      // Mapping key
      if (key === 'targetAmount') dbKey = 'target_amount';
      if (key === 'savedAmount') dbKey = 'saved_amount';
      if (key === 'name') dbKey = 'name';
      
      if (allowedUpdates.includes(dbKey) && value !== undefined) {
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    }

    console.log('Fields to update:', fields);
    console.log('Values:', values);

    if (fields.length === 0) {
      console.log('No fields to update');
      return null;
    }

    values.push(id, userId);
    const query = `UPDATE wishlists SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    
    console.log('Query:', query);
    console.log('Query values:', values);
    
    const [result] = await pool.execute(query, values);
    
    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      console.log('No rows affected - wishlist not found or no changes');
      return null;
    }

    // Ambil data yang sudah diupdate
    const updated = await this.findById(id);
    console.log('Updated wishlist:', updated);
    
    return updated;
  } catch (error) {
    console.error('Error in Wishlist.update:', error);
    throw error;
  }
}

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM wishlists WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  static async getProgress(id, userId) {
    const [rows] = await pool.execute(
      `SELECT 
        name,
        target_amount,
        saved_amount,
        ROUND((saved_amount / target_amount) * 100, 2) as progress_percentage
      FROM wishlists
      WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return rows[0];
  }

  static async getSummary(userId) {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total_items,
        SUM(target_amount) as total_target,
        SUM(saved_amount) as total_saved,
        AVG((saved_amount / target_amount) * 100) as average_progress
      FROM wishlists
      WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  }
}

module.exports = Wishlist;