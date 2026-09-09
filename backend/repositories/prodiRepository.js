const db = require('../config/db');

class ProdiRepository {
  async findAll(includeInactive = false) {
    const condition = includeInactive ? '' : 'WHERE aktif = 1';
    const [rows] = await db.query(`SELECT id, nama_prodi, kode_prodi, aktif FROM prodi ${condition} ORDER BY nama_prodi ASC`);
    return rows;
  }

  async create({ nama_prodi, kode_prodi }) {
    const [result] = await db.query('INSERT INTO prodi (nama_prodi, kode_prodi) VALUES (?, ?)', [nama_prodi, kode_prodi || null]);
    return result.insertId;
  }

  async update(id, { nama_prodi, kode_prodi, aktif }) {
    const [result] = await db.query('UPDATE prodi SET nama_prodi = ?, kode_prodi = ?, aktif = ? WHERE id = ?', [nama_prodi, kode_prodi || null, aktif === undefined ? 1 : Boolean(aktif), id]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.query('DELETE FROM prodi WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new ProdiRepository();