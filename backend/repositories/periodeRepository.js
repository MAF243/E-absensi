const db = require('../config/db');

class PeriodeRepository {
  async findAll() {
    const [results] = await db.query("SELECT * FROM periode_akademik ORDER BY id DESC");
    return results;
  }
  async getActive() {
    const [results] = await db.query("SELECT * FROM periode_akademik WHERE status = 'aktif' LIMIT 1");
    return results[0];
  }
  async create(data) {
    const [result] = await db.query("INSERT INTO periode_akademik (nama_periode, status) VALUES (?, ?)", [data.nama_periode, data.status || 'tidak aktif']);
    return result.insertId;
  }
  async update(id, data) {
    const [result] = await db.query("UPDATE periode_akademik SET nama_periode = ?, status = ? WHERE id = ?", [data.nama_periode, data.status, id]);
    return result.affectedRows > 0;
  }
  async setSemuaTidakAktif() {
    await db.query("UPDATE periode_akademik SET status = 'tidak aktif'");
  }
  async delete(id) {
    await db.query("DELETE FROM periode_akademik WHERE id = ?", [id]);
  }
}

module.exports = new PeriodeRepository();
