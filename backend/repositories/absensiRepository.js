const db = require('../config/db');

class AbsensiRepository {
  async getSesiAktif(mk_id) {
    const [aktif] = await db.query("SELECT id FROM sesi_kuliah WHERE mk_id = ? AND status = 'berlangsung'", [mk_id]);
    return aktif.length ? aktif[0].id : null;
  }
  
  async cekAbsen(mahasiswa_id, sesi_id) {
    const [cekAbsen] = await db.query(`SELECT id FROM absensi WHERE user_id = ? AND sesi_id = ?`, [mahasiswa_id, sesi_id]);
    return cekAbsen.length > 0;
  }

  async cekKepesertaan(mahasiswa_id, mk_id) {
    const query = `
      SELECT mk.id 
      FROM mata_kuliah mk
      LEFT JOIN users u ON u.angkatan_id = mk.angkatan_id AND mk.jenis_kelas = 'paket' AND u.id = ?
      LEFT JOIN peserta_kelas pk ON pk.mk_id = mk.id AND mk.jenis_kelas = 'kelompok' AND pk.mahasiswa_id = ?
      LEFT JOIN grup_mahasiswa gm ON gm.mk_id = mk.id AND gm.mahasiswa_id = ?
      WHERE mk.id = ? 
        AND (u.id IS NOT NULL OR pk.mahasiswa_id IS NOT NULL OR gm.mahasiswa_id IS NOT NULL)
    `;
    const [results] = await db.query(query, [mahasiswa_id, mahasiswa_id, mahasiswa_id, mk_id]);
    return results.length > 0;
  }
  
  async catatKehadiran(mahasiswa_id, mk_id, sesi_id) {
    await db.query(`INSERT INTO absensi (user_id, mk_id, sesi_id, tanggal, status) VALUES (?, ?, ?, NOW(), 'hadir')`, [mahasiswa_id, mk_id, sesi_id]);
  }
  
  async getRiwayatDosen(dosen_id) {
    const query = `
      SELECT s.id as sesi_id, s.waktu_mulai, s.waktu_selesai, s.agenda, s.jenis_sesi, s.tipe,
             m.kode_mk, m.nama_mk, m.jenis_kelas, m.angkatan_id, m.jurusan, a.nama_angkatan,
             (SELECT COUNT(*) FROM absensi ab WHERE ab.sesi_id = s.id AND ab.status = 'hadir') as total_hadir,
             CASE
               WHEN m.jenis_kelas = 'paket' THEN (SELECT COUNT(*) FROM users u2 WHERE u2.role = 'mahasiswa' AND u2.angkatan_id = m.angkatan_id)
               ELSE (SELECT COUNT(*) FROM peserta_kelas pk WHERE pk.mk_id = m.id)
             END as total_peserta
      FROM sesi_kuliah s
      JOIN mata_kuliah m ON s.mk_id = m.id
      LEFT JOIN angkatan a ON m.angkatan_id = a.id
      WHERE s.dosen_id = ? AND s.status = 'selesai'
      ORDER BY s.waktu_mulai DESC
    `;
    const [results] = await db.query(query, [dosen_id]);
    return results;
  }
  
  async getSesiMk(sesi_id) {
    const [sesi] = await db.query("SELECT mk_id FROM sesi_kuliah WHERE id = ?", [sesi_id]);
    return sesi.length ? sesi[0].mk_id : null;
  }
  
  async getMkInfo(mk_id) {
    const [mk] = await db.query("SELECT jenis_kelas, angkatan_id FROM mata_kuliah WHERE id = ?", [mk_id]);
    return mk.length ? mk[0] : null;
  }
  
  async getMahasiswaPaket(angkatan_id, mk_id) {
    const query = `
      SELECT id, nomor_induk, nama_lengkap, jurusan FROM users 
      WHERE role='mahasiswa' AND angkatan_id=? 
      UNION 
      SELECT u.id, u.nomor_induk, u.nama_lengkap, u.jurusan 
      FROM grup_mahasiswa gm 
      JOIN users u ON gm.mahasiswa_id = u.id 
      WHERE gm.mk_id=?
      ORDER BY nama_lengkap ASC
    `;
    const [mahasiswa] = await db.query(query, [angkatan_id, mk_id]);
    return mahasiswa;
  }
  
  async getMahasiswaLintas(mk_id) {
    const [mahasiswa] = await db.query("SELECT u.id, u.nomor_induk, u.nama_lengkap, u.jurusan FROM peserta_kelas pk JOIN users u ON pk.mahasiswa_id = u.id WHERE pk.mk_id = ? ORDER BY u.nama_lengkap ASC", [mk_id]);
    return mahasiswa;
  }
  
  async getAbsensiSesi(sesi_id) {
    const [absensi] = await db.query("SELECT user_id, status FROM absensi WHERE sesi_id = ?", [sesi_id]);
    return absensi;
  }
  
  async simpanRekapManual(sesi_id, mk_id, rekap_data) {
    await db.query("DELETE FROM absensi WHERE sesi_id = ?", [sesi_id]);
    if (rekap_data && rekap_data.length > 0) {
      const values = rekap_data.map(d => [d.user_id, mk_id, sesi_id, d.status]);
      await db.query("INSERT INTO absensi (user_id, mk_id, sesi_id, status) VALUES ?", [values]);
    }
  }
}
module.exports = new AbsensiRepository();
