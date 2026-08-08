const db = require('../config/db');

class AngkatanRepository {
  async findAll() {
    const [results] = await db.query("SELECT * FROM angkatan ORDER BY id DESC");
    return results;
  }
  async create(nama_angkatan) {
    await db.query("INSERT INTO angkatan (nama_angkatan) VALUES (?)", [nama_angkatan]);
  }
  async update(id, nama_angkatan) {
    const [result] = await db.query("UPDATE angkatan SET nama_angkatan = ? WHERE id = ?", [nama_angkatan, id]);
    return result.affectedRows > 0;
  }
  async delete(id) {
    await db.query("DELETE FROM angkatan WHERE id = ?", [id]);
  }
}
module.exports = new AngkatanRepository();
