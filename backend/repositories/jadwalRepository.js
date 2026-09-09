const db = require('../config/db');

class JadwalRepository {
  async runCronJobs() {
    await db.query(`UPDATE sesi_kuliah sk JOIN mata_kuliah mk ON sk.mk_id = mk.id SET sk.status = 'selesai', sk.waktu_selesai = NOW() WHERE sk.status = 'berlangsung' AND DATE(sk.waktu_mulai) = CURDATE() AND CURTIME() > mk.jam_selesai`);
    await db.query(`UPDATE sesi_kuliah SET status = 'selesai', waktu_selesai = NOW() WHERE status = 'berlangsung' AND DATE(waktu_mulai) < CURDATE()`);
  }

  async getJadwal(dosenId = null) {
    const whereClause = dosenId ? 'WHERE m.dosen_id = ?' : '';
    const query = `
      SELECT m.id, m.kode_mk, m.nama_mk, m.semester, m.hari, m.dosen_id, m.jurusan, m.jenis_kelas, m.kelas_id, m.target_pertemuan, m.ruangan,
             DATE_FORMAT(m.jam_mulai, '%H:%i') as jam_mulai, 
             DATE_FORMAT(m.jam_selesai, '%H:%i') as jam_selesai,
             u.nama_lengkap AS dosen_nama,
             a.nama_angkatan,
             k.nama_kelas,
             (
                SELECT GROUP_CONCAT(DISTINCT usr.jurusan SEPARATOR ', ')
                FROM peserta_kelas pk
                JOIN users usr ON pk.mahasiswa_id = usr.id
                WHERE pk.mk_id = m.id
             ) AS kelompok_jurusan,
             (
                SELECT SUM(sk2.bobot) FROM sesi_kuliah sk2 WHERE sk2.mk_id = m.id AND sk2.status != 'CANCELLED'
             ) AS total_pertemuan,
             s.id AS sesi_aktif_id, s.tipe AS sesi_tipe, s.status AS sesi_status, s.link_meet
      FROM mata_kuliah m
      LEFT JOIN users u ON m.dosen_id = u.id
      LEFT JOIN angkatan a ON m.angkatan_id = a.id
      LEFT JOIN kelas k ON m.kelas_id = k.id
      LEFT JOIN sesi_kuliah s ON s.mk_id = m.id AND s.status = 'berlangsung'
      ${whereClause}
      ORDER BY m.semester ASC, m.nama_mk ASC
    `;
    const [results] = await db.query(query, dosenId ? [dosenId] : []);
    return results;
  }

  async updateJadwal(id, data) {
    await db.query("UPDATE mata_kuliah SET hari=?, jam_mulai=?, jam_selesai=?, target_pertemuan=?, ruangan=? WHERE id=?", 
      [data.hari, data.jam_mulai, data.jam_selesai, data.target_pertemuan || 16, data.ruangan || null, id]);
  }

  async resetJadwal(id) {
    await db.query("UPDATE mata_kuliah SET hari=NULL, jam_mulai=NULL, jam_selesai=NULL, ruangan=NULL WHERE id=?", [id]);
  }

  async checkMk(mk_id) {
    const query = `
      SELECT dosen_id, hari, jam_mulai, jam_selesai,
        CASE WHEN hari = (
          CASE DAYOFWEEK(CURDATE())
            WHEN 1 THEN 'Minggu' WHEN 2 THEN 'Senin' WHEN 3 THEN 'Selasa'
            WHEN 4 THEN 'Rabu' WHEN 5 THEN 'Kamis' WHEN 6 THEN 'Jumat' WHEN 7 THEN 'Sabtu'
          END
        ) THEN 1 ELSE 0 END as hari_valid,
        CASE WHEN CURTIME() >= jam_mulai AND CURTIME() <= jam_selesai THEN 1 ELSE 0 END as waktu_valid,
        (
          CASE DAYOFWEEK(CURDATE())
            WHEN 1 THEN 'Minggu' WHEN 2 THEN 'Senin' WHEN 3 THEN 'Selasa'
            WHEN 4 THEN 'Rabu' WHEN 5 THEN 'Kamis' WHEN 6 THEN 'Jumat' WHEN 7 THEN 'Sabtu'
          END
        ) as current_hari,
        DATE_FORMAT(CURTIME(), '%H:%i') as current_time_str,
        DATE_FORMAT(jam_mulai, '%H:%i') as jam_mulai_str,
        DATE_FORMAT(jam_selesai, '%H:%i') as jam_selesai_str
      FROM mata_kuliah WHERE id = ?
    `;
    const [mk] = await db.query(query, [mk_id]);
    return mk.length ? mk[0] : null;
  }

  async checkActiveSesi(mk_id) {
    const [cek] = await db.query("SELECT id FROM sesi_kuliah WHERE mk_id = ? AND status = 'berlangsung'", [mk_id]);
    return cek.length > 0;
  }

  async bukaSesi(data) {
    const finalLink = (data.tipe === 'online') ? data.link_meet : null;
    await db.query("INSERT INTO sesi_kuliah (mk_id, dosen_id, tipe, link_meet, status, agenda, jenis_sesi, bobot) VALUES (?, ?, ?, ?, 'berlangsung', ?, ?, ?)", [data.mk_id, data.dosen_id, data.tipe, finalLink, data.agenda, data.jenis_sesi || 'Reguler', data.bobot || 1]);
  }

  async tutupSesi(sesi_id) {
    await db.query("UPDATE sesi_kuliah SET status = 'selesai', waktu_selesai = NOW() WHERE id = ?", [sesi_id]);
  }

  async getSesiInfo(sesi_id) {
    const [results] = await db.query('SELECT id, mk_id, dosen_id, status FROM sesi_kuliah WHERE id = ?', [sesi_id]);
    return results[0] || null;
  }

  // Safe delete logic: Batalkan Sesi
  async checkSesiPresence(sesi_id) {
    const [results] = await db.query("SELECT COUNT(*) as count FROM absensi WHERE sesi_id = ?", [sesi_id]);
    return results[0].count > 0;
  }

  async batalkanSesi(sesi_id) {
    // We update status to 'CANCELLED'
    await db.query("UPDATE sesi_kuliah SET status = 'CANCELLED' WHERE id = ?", [sesi_id]);
  }

  async deleteSesi(sesi_id) {
    await db.query("DELETE FROM sesi_kuliah WHERE id = ?", [sesi_id]);
  }

  async getJadwalByMahasiswa(mahasiswa_id) {
    const [mhs] = await db.query("SELECT angkatan_id, kelas_id FROM users WHERE id = ? AND role = 'mahasiswa'", [mahasiswa_id]);
    if (mhs.length === 0) return null;
    const angkatan_id = mhs[0].angkatan_id || 0;
    const kelas_id = mhs[0].kelas_id || 0;

    const query = `
      SELECT m.id, m.kode_mk, m.nama_mk, m.semester, m.hari, m.dosen_id, m.jurusan, m.jenis_kelas, m.ruangan,
             DATE_FORMAT(m.jam_mulai, '%H:%i') as jam_mulai, 
             DATE_FORMAT(m.jam_selesai, '%H:%i') as jam_selesai,
             u.nama_lengkap AS dosen_nama,
             a.nama_angkatan,
             s.id AS sesi_aktif_id, s.tipe AS sesi_tipe, s.status AS sesi_status, s.link_meet
      FROM mata_kuliah m
      LEFT JOIN users u ON m.dosen_id = u.id
      LEFT JOIN angkatan a ON m.angkatan_id = a.id
      LEFT JOIN sesi_kuliah s ON s.mk_id = m.id AND s.status = 'berlangsung'
        WHERE (m.jenis_kelas = 'paket' AND ((m.kelas_id IS NOT NULL AND m.kelas_id = ?) OR (m.kelas_id IS NULL AND m.angkatan_id = ?) OR (m.kelas_id IS NULL AND m.jurusan = (SELECT jurusan FROM users WHERE id = ?))))
         OR (m.jenis_kelas = 'kelompok' AND EXISTS (
             SELECT 1 FROM peserta_kelas pk WHERE pk.mk_id = m.id AND pk.mahasiswa_id = ?
         ))
      ORDER BY m.jam_mulai ASC
    `;
    const [results] = await db.query(query, [kelas_id, angkatan_id, mahasiswa_id, mahasiswa_id]);
    return results;
  }
}
module.exports = new JadwalRepository();
