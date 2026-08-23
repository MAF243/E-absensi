const db = require('../config/db');

class AuthRepository {
  async findUserByIdentitas(identitas) {
    const query = `
      SELECT * FROM users 
      WHERE (
        LOWER(TRIM(nomor_induk)) = LOWER(TRIM(?)) 
        OR LOWER(TRIM(nama_lengkap)) = LOWER(TRIM(?))
        OR LOWER(TRIM(inisial)) = LOWER(TRIM(?))
      )
    `;
    const [results] = await db.query(query, [identitas, identitas, identitas]);
    return results.length > 0 ? results[0] : null;
  }

  async updateLastLogin(userId) {
    await db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [userId]);
  }
}

module.exports = new AuthRepository();
