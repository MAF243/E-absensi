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

  async updateProfile(userId, data) {
    const fields = ['nomor_induk = ?', 'nama_lengkap = ?'];
    const params = [data.nomor_induk, data.nama_lengkap];
    if (data.password) {
      fields.push('password = ?');
      params.push(data.password);
    }
    params.push(userId);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ? AND role = 'admin'`, params);
    return { nama: data.nama_lengkap, nomor_induk: data.nomor_induk };
  }
}

module.exports = new AuthRepository();
