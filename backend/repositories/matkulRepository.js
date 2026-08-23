const db = require('../config/db');

class MatkulRepository {
  async findAll() {
    const query = `
      SELECT m.*, u.nama_lengkap as nama_dosen, a.nama_angkatan, k.nama_kelas, p.nama_periode,
             (SELECT COUNT(*) FROM sesi_kuliah WHERE mk_id = m.id) as jumlah_sesi,
             (SELECT COUNT(*) FROM peserta_kelas WHERE mk_id = m.id) as jumlah_peserta
      FROM mata_kuliah m
      LEFT JOIN users u ON m.dosen_id = u.id
      LEFT JOIN angkatan a ON m.angkatan_id = a.id
      LEFT JOIN kelas k ON m.kelas_id = k.id
      LEFT JOIN periode_akademik p ON m.periode_id = p.id
      ORDER BY m.created_at DESC
    `;
    const [results] = await db.query(query);
    return results;
  }
  
  async create(data) {
    await db.query("INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, jurusan, semester, periode_id) VALUES (?, ?, ?, ?, ?, ?)", [data.kode_mk, data.nama_mk, data.sks || 2, data.jurusan, data.semester, data.periode_id || null]);
  }

  async update(id, data) {
    await db.query("UPDATE mata_kuliah SET kode_mk=?, nama_mk=?, sks=?, jurusan=?, semester=?, periode_id=? WHERE id=?", [data.kode_mk, data.nama_mk, data.sks, data.jurusan, data.semester, data.periode_id || null, id]);
  }

  async delete(id) {
    await db.query("DELETE FROM mata_kuliah WHERE id=?", [id]);
  }

  async bulkDelete(ids) {
    await db.query("DELETE FROM mata_kuliah WHERE id IN (?)", [ids]);
  }

  async resetPenugasan(ids) {
    await db.query("UPDATE mata_kuliah SET dosen_id=NULL, kelas_id=NULL WHERE id IN (?)", [ids]);
  }

  async assignMatkul(id, data) {
    await db.query("UPDATE mata_kuliah SET dosen_id=?, kelas_id=?, jenis_kelas=? WHERE id=?", 
      [data.dosen_id || null, data.jenis_kelas === 'paket' ? (data.kelas_id || null) : null, data.jenis_kelas, id]);
    
    await db.query("DELETE FROM peserta_kelas WHERE mk_id=?", [id]);
    if (data.jenis_kelas === 'kelompok' && data.peserta && data.peserta.length > 0) {
      const values = data.peserta.map(mhsId => [id, mhsId]);
      await db.query("INSERT INTO peserta_kelas (mk_id, mahasiswa_id) VALUES ?", [values]);
    }
  }

  async getMatkulDetail(id) {
    const [mk] = await db.query("SELECT jenis_kelas, kelas_id FROM mata_kuliah WHERE id = ?", [id]);
    return mk.length > 0 ? mk[0] : null;
  }

  async getPesertaPaket(kelasId) {
    const query = `
      SELECT id, nomor_induk, nama_lengkap, jenis_kelamin, status_akademik, jurusan 
      FROM users 
      WHERE role = 'mahasiswa' 
      AND kelas_id = ?
      ORDER BY nama_lengkap ASC
    `;
    const [results] = await db.query(query, [kelasId]);
    return results;
  }

  async getPesertaLintas(id) {
    const query = `
      SELECT u.id, u.nomor_induk, u.nama_lengkap, u.jurusan, u.jenis_kelamin
      FROM peserta_kelas pk JOIN users u ON pk.mahasiswa_id = u.id
      WHERE pk.mk_id = ? ORDER BY u.nama_lengkap ASC
    `;
    const [results] = await db.query(query, [id]);
    return results;
  }

  async getPesertaIds(id) {
    const [results] = await db.query("SELECT mahasiswa_id FROM peserta_kelas WHERE mk_id = ?", [id]);
    return results.map(p => p.mahasiswa_id);
  }

  async deletePeserta(mk_id, mhs_id) {
    await db.query("DELETE FROM peserta_kelas WHERE mk_id = ? AND mahasiswa_id = ?", [mk_id, mhs_id]);
  }

  async bulkCreate(data) {
    const values = data.map(d => [d.kode_mk, d.nama_mk, d.sks || 2, d.jurusan || '', d.semester || 'Ganjil', d.periode_id || null]);
    await db.query("INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, jurusan, semester, periode_id) VALUES ?", [values]);
  }
}
module.exports = new MatkulRepository();
